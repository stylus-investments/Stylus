import { publicProcedure } from "@/trpc/trpc";
import db from "@/db/db";
import { getMoralis } from "@/lib/moralis";
import { TRPCError } from "@trpc/server";
import Moralis from "moralis";
import { getCurrentBalance, getRewardsAccumulated, getTokenPrice, getUserTokenData } from "@/lib/prices";
import { calculateBalanceArray } from "@/lib/balances";
import { rateLimiter } from "@/lib/ratelimiter";
import { getUserId, privy } from "@/lib/privy";
import { BASE_CHAIN_ID, EARN_ADDRESS, SBTC, SAVE, USDC_ADDRESS, SPHP, SHKD } from "@/lib/token_address";
import { ORDERSTATUS } from "@/constant/order";
import { z } from "zod";

export const dashboardRoute = {
    getStakingData: publicProcedure.query(async () => {

        try {

            const [nextSnapshot, currentSnapshot] = await Promise.all([
                db.snapshot.findMany({
                    where: {
                        completed: false
                    }
                }),
                db.user_snapshot.findFirst({
                    orderBy: {
                        created_at: "desc"
                    }
                }),
            ])

            const getNext4PMUTC = () => {
                const now = new Date();
                const next4PM = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 16, 0, 0));

                if (now.getTime() > next4PM.getTime()) {
                    next4PM.setUTCDate(next4PM.getUTCDate() + 1);
                }

                return next4PM.toISOString();
            }

            return {
                next_snapshot: nextSnapshot.length > 0 ? nextSnapshot[0].end_date.toString() : getNext4PMUTC(),
                stake: currentSnapshot ? {
                    sAVE: currentSnapshot.stake,
                    sBTC: currentSnapshot.balance
                } : {
                    sAVE: "0.0000",
                    sBTC: "0.0000"
                },
                reward: currentSnapshot ? currentSnapshot.reward : "0.0000",
                status: currentSnapshot ? currentSnapshot.status : 4,
            }

        } catch (error: any) {
            console.log(error);
            throw new TRPCError({
                code: error.code,
                message: error.message
            })
        } finally {
            await db.$disconnect()
        }

    }),
    getWalletData: publicProcedure.query(async () => {

        try {


            const auth = await getUserId()
            if (!auth) throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "Login First."
            })

            const user = await privy.getUserById(auth)

            const userWalletAddress = user.wallet?.address as string

            const currencyExchangeRate = await db.currency_conversion.findMany()

            await getMoralis()

            const getAssets = await Promise.all([
                getUserTokenData({
                    tokenAddress: SHKD,
                    chain: BASE_CHAIN_ID,
                    tokenName: "SHKD",
                    tokenSymbol: "sHKD",
                    tokenLogo: "/icons/logo/logo.svg",
                    walletAddress: userWalletAddress,
                    currencyExchangeRate
                }),
                getUserTokenData({
                    tokenAddress: SPHP,
                    chain: BASE_CHAIN_ID,
                    tokenName: "SPHP",
                    tokenSymbol: "sPHP",
                    tokenLogo: "/icons/token/sphp.svg",
                    walletAddress: userWalletAddress,
                    currencyExchangeRate
                }),
                getUserTokenData({
                    tokenAddress: SAVE,
                    chain: BASE_CHAIN_ID,
                    tokenName: "SAVE",
                    tokenSymbol: "sAVE",
                    tokenLogo: "/icons/token/save.svg",
                    walletAddress: userWalletAddress,
                    currencyExchangeRate
                }),
                // getUserTokenData({
                //     tokenAddress: USDC_ADDRESS,
                //     chain: BASE_CHAIN_ID,
                //     tokenName: "USD Coin",
                //     tokenSymbol: "USDC",
                //     tokenLogo: "/icons/token/usdc.png",
                //     walletAddress: userWalletAddress,
                //     currencyExchangeRate
                // }),
            ])

            const assets = getAssets.filter(asset => asset !== null)

            // console.log(assets)

            const currentBalance = await getCurrentBalance({
                totalSHKD: assets.find(asset => asset?.symbol === 'SHKD')?.amount,
                // totalSBTC: assets.find(asset => asset?.symbol === 'sBTC')?.amount,
                totalSAVE: assets.find(asset => asset?.symbol === 'sAVE')?.amount,
                totalSPHP: assets.find(asset => asset?.symbol === 'sPHP')?.amount,
            })

            const currentBalanceArray = calculateBalanceArray({ currencyExchangeRate, balance: currentBalance })

            const dashboardWalletData = {
                balances: {
                    assets,
                    current_save_balance: assets.find(asset => asset?.symbol === 'SAVE')?.amount,
                    currentBalances: currentBalanceArray
                }
            }

            return dashboardWalletData

        } catch (error: any) {
            console.log(error);
            throw new TRPCError({
                code: error.code,
                message: error.message
            })
        } finally {
            await db.$disconnect()
        }


    }),
    getUserBalances: publicProcedure.query(async () => {

    }),
    getRewardData: publicProcedure.query(async () => {

        const auth = await getUserId()
        if (!auth) throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Login First."
        })
        const user = await privy.getUserById(auth)

        const userWalletAddress = user.wallet?.address as string

        await getMoralis()
        const currencyExchangeRate = await db.currency_conversion.findMany()

        const [usdcPrice, userSnapshots, earn, svn] = await Promise.all([
            getTokenPrice({
                tokenAddress: USDC_ADDRESS,
                chain: BASE_CHAIN_ID,
            }),
            db.user_snapshot.findMany({
                where: { user_id: user.id },
                orderBy: {
                    created_at: 'desc'
                }
            }),
            getUserTokenData({
                tokenAddress: EARN_ADDRESS,
                walletAddress: userWalletAddress,
                tokenName: "EARN",
                tokenSymbol: "EARN",
                tokenLogo: "/icons/token/logo.svg",
                chain: BASE_CHAIN_ID,
                currencyExchangeRate
            }),
            getUserTokenData({
                tokenAddress: SAVE,
                walletAddress: userWalletAddress,
                chain: BASE_CHAIN_ID,
                tokenName: "SAVE",
                tokenSymbol: "sAVE",
                tokenLogo: "/icons/token/save.svg",
                currencyExchangeRate
            }),
        ])

        const rewardsAccumulated = getRewardsAccumulated({
            usdcPrice: usdcPrice?.raw.usdPriceFormatted as string,
            totalEarn: earn?.amount as string,
            totalSvn: svn?.amount as string
        })

        const rewardsAccumulatedBalanceArray = calculateBalanceArray({ currencyExchangeRate, balance: rewardsAccumulated })

        const userTotalEarnTokenRewardsReceived = userSnapshots.reduce((total, snapshot) => {
            if (snapshot.status === 3) {
                return total + Number(snapshot.reward)
            }
            return total
        }, 0).toFixed(10)

        const dashboardRewardData = {
            balances: {
                current_earn_balance: earn?.amount,
                current_svn_balance: svn?.amount
            },
            rewardsAccumulated: rewardsAccumulatedBalanceArray,
            total_reward_received: userTotalEarnTokenRewardsReceived,
            upcoming_reward: userSnapshots.length > 0 ? userSnapshots[0].reward : "0.000000"
        }

        return dashboardRewardData

    }),
    getTokenBalanceHistory: publicProcedure.input(z.string()).query(async ({ input }) => {

        try {

            await rateLimiter.consume(1)
            const user = await getUserId()
            if (!user) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            const userInfo = await db.user_info.findUnique({ where: { user_id: user } })
            if (!userInfo) throw new TRPCError({
                code: "NOT_FOUND",
                message: "Oops."
            })

            await getMoralis()

            const [getTokenBalanceHistory, tokenData] = await Promise.all([
                Moralis.EvmApi.token.getWalletTokenTransfers({
                    chain: BASE_CHAIN_ID,
                    order: "ASC",
                    address: userInfo.wallet,
                    contractAddresses: [input]
                }),
                Moralis.EvmApi.token.getWalletTokenBalances({
                    chain: BASE_CHAIN_ID,
                    address: userInfo.wallet,
                    tokenAddresses: [
                        input
                    ],
                })
            ])

            if (!tokenData) throw new TRPCError({
                code: "NOT_FOUND",
                message: "Token not found"
            })
            if (!getTokenBalanceHistory) throw new TRPCError({
                code: 'BAD_REQUEST',
                message: "Failed to get wallet go balance history"
            })

            const tokenBalanceHistory = getTokenBalanceHistory.result
                .map((history, index) => ({
                    id: history.transactionHash,
                    date: history.blockTimestamp.toISOString(),
                    type: history.toAddress.lowercase === userInfo.wallet.toLowerCase() ? 'Deposit' : 'Withdrawal',
                    amount: (Number(history.value) / 10 ** tokenData.result[0].decimals).toString(),
                    number: index + 1
                }))
                .reverse()

            return tokenBalanceHistory

        } catch (error: any) {
            console.log(error);
            throw new TRPCError({
                code: error.code,
                message: error.message
            })
        } finally {
            await db.$disconnect()
        }

    }),
    getUserSnapshotHistory: publicProcedure.query(async () => {

        try {

            await rateLimiter.consume(1)

            const user = await getUserId()

            if (!user) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            const userSnapshotHistory = await db.user_snapshot.findMany({
                where: { user_id: user },
                include: {
                    snapshot: {
                        select: {
                            start_date: true,
                            end_date: true
                        }
                    }
                },
                orderBy: {
                    created_at: "desc"
                }
            })
            const snapshotHistory = userSnapshotHistory
                .map((snapshotData, index) => ({
                    ...snapshotData,
                    snapshot: {
                        start_date: snapshotData.snapshot.start_date.toISOString(),
                        end_date: snapshotData.snapshot.end_date.toISOString(),
                    },
                    month: index + 1
                }))
                .reverse()

            return snapshotHistory

        } catch (error: any) {
            console.log(error);
            throw new TRPCError({
                code: error.code,
                message: error.message
            })
        } finally {
            await db.$disconnect()
        }

    }),
    getUserAccountStatus: publicProcedure.query(async () => {
        try {

            await rateLimiter.consume(1)
            const user = await getUserId()

            if (!user) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            const userInfo = await db.user_info.findUnique({
                where: { user_id: user }, select: {
                    status: true,
                    investment_plans: {
                        select: {
                            insurance: true,
                            payments: {
                                select: {
                                    status: true
                                }
                            }
                        }
                    }
                }
            })
            if (!userInfo) throw new TRPCError({
                code: "NOT_FOUND"
            })

            // Extract user status
            const userStatus = userInfo.status;

            // Check if the user has insurance
            const hasInsurance = userInfo.investment_plans.some(plan => plan.insurance);

            // Check for unpaid orders
            const hasUnpaidOrders = userInfo.investment_plans.some(plan =>
                plan.payments.some(payment => payment.status === ORDERSTATUS['unpaid'])
            );
            // Return results in an object
            return {
                userStatus,
                hasInsurance,
                hasUnpaidOrders
            };

        } catch (error: any) {
            console.log(error);
            throw new TRPCError({
                code: error.code,
                message: error.message
            })
        } finally {
            await db.$disconnect()
        }
    }),
    getAssetData: publicProcedure.input(z.object({
        tokenAddress: z.string(),
        tokenName: z.string(),
        tokenSymbol: z.string(),
        tokenLogo: z.string()
    })).query(async ({ input }) => {
        try {

            const user = await getUserId()
            if (!user) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            const [userInfo, currencyExchangeRate] = await Promise.all([
                db.user_info.findUnique({ where: { user_id: user } }),
                db.currency_conversion.findMany()
            ])
            if (!userInfo) throw new TRPCError({
                code: "NOT_FOUND",
                message: "Oops"
            })

            await getMoralis()

            const tokenValue = await getUserTokenData({
                chain: BASE_CHAIN_ID,
                tokenAddress: input.tokenAddress,
                tokenName: input.tokenName,
                tokenSymbol: input.tokenSymbol,
                tokenLogo: input.tokenLogo,
                currencyExchangeRate,
                walletAddress: userInfo.wallet
            })
            if (!tokenValue) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Something went wrong while getting asset data"
            })

            return tokenValue

        } catch (error) {
            if (error instanceof TRPCError) {
                throw new TRPCError({
                    code: error.code,
                    message: error.message,
                    cause: error.cause,
                })
            }
            console.error(error)
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Server error"
            })
        } finally {
            await db.$disconnect()
        }
    })
}