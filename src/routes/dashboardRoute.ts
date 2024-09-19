import { publicProcedure } from "@/trpc/trpc";
import db from "@/db/db";
import { getMoralis } from "@/lib/moralis";
import { TRPCError } from "@trpc/server";
import Moralis from "moralis";
import { z } from "zod";
import { getCurrentBalance, getRewardsAccumulated, getUserTokenData } from "@/lib/prices";
import { calculateBalanceArray } from "@/lib/balances";
import { rateLimiter } from "@/lib/ratelimiter";
import { getUserId, privy } from "@/lib/privy";
import { BASE_CHAIN_ID, EARN_ADDRESS, SBTC, SVN_ADDRESS, USDC_ADDRESS } from "@/lib/token_address";

export const dashboardRoute = {
    getWalletData: publicProcedure.query(async (opts) => {

        const auth = await getUserId()

        if (!auth) throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Login First."
        })

        const user = await privy.getUser(auth)
        const userWalletAddress = user.wallet?.address as string

        const [nextSnapshot, currentSnapshot, usdcPrice, currencyExchangeRate] = await Promise.all([
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
            getUserTokenData({
                tokenAddress: USDC_ADDRESS,
                tokenName: "USDC",
                chain: BASE_CHAIN_ID,
                walletAddress: userWalletAddress

            }),
            db.currency_conversion.findMany()
        ])

        const assets = await Promise.all([
            getUserTokenData({
                tokenAddress: SBTC,
                tokenName: "SAVE",
                chain: BASE_CHAIN_ID,
                walletAddress: userWalletAddress

            }),
            getUserTokenData({
                tokenAddress: USDC_ADDRESS,
                tokenName: "USDC",
                chain: BASE_CHAIN_ID,
                walletAddress: userWalletAddress

            }),
            getUserTokenData({
                tokenAddress: EARN_ADDRESS,
                tokenName: "EARN",
                chain: BASE_CHAIN_ID,
                walletAddress: userWalletAddress

            }),
            getUserTokenData({
                tokenAddress: SVN_ADDRESS,
                tokenName: "SVN",
                chain: BASE_CHAIN_ID,
                walletAddress: userWalletAddress

            }),
        ])
        const currentBalance = getCurrentBalance({
            usdcPrice: usdcPrice.price,
            totalUsdc: assets.find(asset => asset.symbol === 'USDC')?.amount as string,
            totalSave: assets.find(asset => asset.symbol === 'SAVE')?.amount as string
        })

        const currentBalanceArray = calculateBalanceArray({ currencyExchangeRate, balance: currentBalance })

        function getNext4PMUTC() {
            const now = new Date();
            const next4PM = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 16, 0, 0));

            if (now.getTime() > next4PM.getTime()) {
                next4PM.setUTCDate(next4PM.getUTCDate() + 1);
            }

            return next4PM.toISOString();
        }

        const dashboardWalletData = {
            snapshot: {
                next_snapshot: nextSnapshot.length > 0 ? nextSnapshot[0].end_date.toString() : getNext4PMUTC(),
                current_stake: currentSnapshot ? currentSnapshot.stake : "0.0000",
                reward: currentSnapshot ? currentSnapshot.reward : "0.0000",
                status: currentSnapshot ? currentSnapshot.status : 4,
            },
            balances: {
                assets,
                current_save_balance: assets.find(asset => asset.symbol === 'SAVE')?.amount as string,
                usdc_price: usdcPrice,
                currentBalances: currentBalanceArray
            }
        }

        return dashboardWalletData

    }),
    getRewardData: publicProcedure.input(z.object({
        walet_address: z.string()
    })).query(async (opts) => {

        const userWalletAddress = opts.input.walet_address

        const user = await getUserId()

        if (!user || !userWalletAddress) throw new TRPCError({
            code: "UNAUTHORIZED"
        })

        const [currencyExchangeRate, usdcPrice, userSnapshots] = await Promise.all([
            db.currency_conversion.findMany(),
            getUserTokenData({
                tokenAddress: USDC_ADDRESS,
                tokenName: "USDC",
                walletAddress: userWalletAddress,
                chain: BASE_CHAIN_ID
            }),
            db.user_snapshot.findMany({
                where: { user_id: user },
                orderBy: {
                    created_at: 'desc'
                }
            })
        ])

        const [earn, svn] = await Promise.all([
            getUserTokenData({
                tokenAddress: EARN_ADDRESS,
                tokenName: "EARN",
                walletAddress: userWalletAddress,
                chain: BASE_CHAIN_ID
            }),
            getUserTokenData({
                tokenAddress: SVN_ADDRESS,
                tokenName: "SVN",
                walletAddress: userWalletAddress,
                chain: BASE_CHAIN_ID
            }),
        ])

        const rewardsAccumulated = getRewardsAccumulated({
            usdcPrice: usdcPrice.price,
            totalEarn: earn.amount,
            totalSvn: svn.amount
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
                current_earn_balance: earn.amount,
                current_svn_balance: svn.amount
            },
            rewardsAccumulated: rewardsAccumulatedBalanceArray,
            total_reward_received: userTotalEarnTokenRewardsReceived,
            upcoming_reward: userSnapshots.length > 0 ? userSnapshots[0].reward : "0.000000"
        }

        return dashboardRewardData

    }),
    getGoTokenBalanceHistory: publicProcedure.query(async () => {

        try {

            await rateLimiter.consume(1)

            await getMoralis()

            const getGoTokenBalanceHistory = await Moralis.EvmApi.token.getWalletTokenTransfers({
                chain: process.env.CHAIN,
                order: "ASC",
                address: "session user wallet",
                contractAddresses: [process.env.SBTC as string]
            })

            if (!getGoTokenBalanceHistory) throw new TRPCError({
                code: 'BAD_REQUEST',
                message: "Failed to get wallet go balance history"
            })

            const goTokenBalanceHistory = getGoTokenBalanceHistory.result
                .map((history, index) => ({
                    id: history.transactionHash,
                    date: history.blockTimestamp.toISOString(),
                    type: history.toAddress.lowercase === "session user wallet".toLowerCase() ? 'Deposit' : 'Withdrawal',
                    amount: (Number(history.value) / 10 ** 10).toString(),
                    number: index + 1
                }))
                .reverse()

            return goTokenBalanceHistory

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

    }
    )
}