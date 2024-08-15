import { publicProcedure } from "@/trpc/trpc";
import db from "@/db/db";
import { getMoralis, getTokenHolders } from "@/lib/moralis";
import { TRPCError } from "@trpc/server";
import Moralis from "moralis";
import { z } from "zod";
import { getCurrentBalance, getFormattedBalance, getRewardsAccumulated, getTokenPrice } from "@/lib/prices";
import { calculateBalanceArray } from "@/lib/balances";
import { rateLimiter } from "@/lib/ratelimiter";
import { getUserId } from "@/lib/privy";

const saveTokenAddress = process.env.SAVE_ADDRESS as string
const earnTokenAddress = process.env.EARN_ADDRESS as string
const usdcTokenAddress = process.env.USDC_ADDRESS as string
const svnTokenAddress = process.env.SVN_ADDRESS as string


export const dashboardRoute = {
    getWalletData: publicProcedure.input(z.object({
        wallet_address: z.string()
    })).query(async (opts) => {

        const userWalletAddress = opts.input.wallet_address

        const user = await getUserId()

        if (!user || !userWalletAddress) throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Login First."
        })

        const [nextSnapshot, currentSnapshot, userToken, usdcPrice, currencyExchangeRate] = await Promise.all([
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
            Moralis.EvmApi.token.getWalletTokenBalances({
                chain: process.env.CHAIN,
                address: userWalletAddress
            }),
            getTokenPrice(usdcTokenAddress),
            db.currency_conversion.findMany()
        ])

        // Function to get formatted balance
        const getFormattedTokenBalance = (tokenAddress: string) => {
            const tokenData: any = getTokenData(tokenAddress);
            const balance = tokenData.balance || 0;
            const decimals = tokenData.decimals || 0;
            return getFormattedBalance({
                balance: balance,
                decimal: decimals
            });
        };

        const getTokenData = (tokenAddress: string) => {
            return userToken.raw.find((token: any) => token.token_address.toLowerCase() === tokenAddress.toLowerCase()) || {};
        };
        const formattedSaveBalance = getFormattedTokenBalance(saveTokenAddress);
        const formattedUsdcBalance = getFormattedTokenBalance(usdcTokenAddress);
        const formattedEarnBalance = getFormattedTokenBalance(earnTokenAddress);
        const formattedSvnBalance = getFormattedTokenBalance(svnTokenAddress);

        const currentBalance = getCurrentBalance({
            usdcPrice,
            totalUsdc: formattedUsdcBalance,
            totalSave: formattedSaveBalance
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
                current_save_balance: formattedSaveBalance,
                current_usdc_balance: formattedUsdcBalance,
                current_earn_balance: formattedEarnBalance,
                current_svn_balance: formattedSvnBalance,
                usdc_price: usdcPrice,
                currentBalances: currentBalanceArray
            }
        }

        return dashboardWalletData

        // liquid_staking: {
        //     snapshot: {
        //         next_snapshot: currentSnapshot[0].end_date.toString(),
        //         current_stake: userWallet.snapshots.length > 0 ? userWallet.snapshots[0].stake && userWallet.snapshots[0].stake : "0.0000000000",
        //         reward: userWallet.snapshots.length > 0 ? userWallet.snapshots[0].reward : "0.0000000000",
        //         status: userWallet.snapshots.length > 0 ? userWallet.snapshots[0].status : 4,
        //     },
        //     currentBalances: currentBalanceArray,
        //     current_save_balance: formattedSaveBalance,
        //     current_usdc_balance: formattedUsdcBalance,
        //     usdcPrice
        // },
    }),
    getRewardData: publicProcedure.input(z.object({
        walet_address: z.string()
    })).query(async (opts) => {

        const userWalletAddress = opts.input.walet_address

        const user = await getUserId()

        if (!user || !userWalletAddress) throw new TRPCError({
            code: "UNAUTHORIZED"
        })

        const [userToken, currencyExchangeRate, usdcPrice, userSnapshots] = await Promise.all([
            Moralis.EvmApi.token.getWalletTokenBalances({
                chain: process.env.CHAIN,
                address: userWalletAddress
            }),
            db.currency_conversion.findMany(),
            getTokenPrice(usdcTokenAddress),
            db.user_snapshot.findMany({
                where: { user_id: user },
                orderBy: {
                    created_at: 'desc'
                }
            })
        ])

        // Function to get formatted balance
        const getFormattedTokenBalance = (tokenAddress: string) => {
            const tokenData: any = getTokenData(tokenAddress);
            const balance = tokenData.balance || 0;
            const decimals = tokenData.decimals || 0;
            return getFormattedBalance({
                balance: balance,
                decimal: decimals
            });
        };

        const getTokenData = (tokenAddress: string) => {
            return userToken.raw.find((token: any) => token.token_address.toLowerCase() === tokenAddress.toLowerCase()) || {};
        };


        const formattedEarnBalance = getFormattedTokenBalance(earnTokenAddress);
        const formattedSvnBalance = getFormattedTokenBalance(svnTokenAddress);


        const rewardsAccumulated = getRewardsAccumulated({
            usdcPrice,
            totalEarn: formattedEarnBalance,
            totalSvn: formattedSvnBalance
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
                current_earn_balance: formattedEarnBalance,
                current_svn_balance: formattedSvnBalance
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
                contractAddresses: [process.env.SAVE_ADDRESS as string]
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