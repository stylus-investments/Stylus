import { publicProcedure } from "@/trpc/trpc";
import db from "@/db/db";
import { getMoralis, getTokenHolders } from "@/lib/moralis";
import { TRPCError } from "@trpc/server";
import Moralis from "moralis";
import { z } from "zod";
import { getAuth } from "@/lib/nextAuth";
import { getCurrentBalance, getFormattedBalance, getRewardsAccumulated, getTokenPrice } from "@/lib/prices";
import { calculateBalanceArray } from "@/lib/balances";
import { rateLimiter } from "@/lib/ratelimiter";

const saveTokenAddress = process.env.SAVE_ADDRESS as string
const earnTokenAddress = process.env.EARN_ADDRESS as string
const usdcTokenAddress = process.env.USDC_ADDRESS as string
const svnTokenAddress = process.env.SVN_ADDRESS as string

export const dashboardRoute = {
    getDashboardData: publicProcedure.query(async () => {
        try {

            await rateLimiter.consume(1)

            const session = await getAuth()

            if (!session) throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: "Unauthorized"
            })

            await getMoralis()

            const [userToken, saveTokenHolders, currentSnapshot, userWallet, userSnapshots, currencyExchangeRate] = await Promise.all([
                Moralis.EvmApi.token.getWalletTokenBalances({
                    chain: process.env.CHAIN,
                    address: session.user.wallet
                }),
                getTokenHolders(),
                db.snapshot.findMany({
                    where: {
                        completed: false
                    }
                }),
                db.user.findUnique({
                    where: { wallet: session.user.wallet },
                    select: {
                        wallet: true,
                        snapshots: {
                            where: {
                                snapshot: {
                                    completed: false
                                }
                            }
                        }
                    }
                }),
                db.user.findUnique({
                    where: {
                        wallet: session.user.wallet
                    },
                    select: {
                        wallet: false,
                        snapshots: {
                            select: {
                                status: true,
                                reward: true
                            }
                        }
                    }
                }),
                db.currency_conversion.findMany()
            ])
            if (!userToken) throw new TRPCError({
                code: 'BAD_REQUEST',
                message: "Failed to get user token"
            })
            if (!saveTokenHolders) throw new TRPCError({
                code: 'BAD_REQUEST',
                message: "Failed to get token holders"
            })

            if (!userWallet || !userSnapshots) throw new TRPCError({
                code: 'NOT_FOUND',
                message: "User Not Found"
            })

            /*

            token balance data

            */

            const getTokenData = (tokenAddress: string) => {
                return userToken.raw.find(token => token.token_address.toLowerCase() === tokenAddress.toLowerCase()) || {};
            };

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

            const usdcPrice = await getTokenPrice(usdcTokenAddress)

            const formattedSaveBalance = getFormattedTokenBalance(saveTokenAddress);
            const formattedUsdcBalance = getFormattedTokenBalance(usdcTokenAddress);
            const formattedEarnBalance = getFormattedTokenBalance(earnTokenAddress);
            const formattedSvnBalance = getFormattedTokenBalance(svnTokenAddress);

            const currentBalance = getCurrentBalance({
                usdcPrice,
                totalUsdc: formattedUsdcBalance,
                totalSave: formattedSaveBalance
            })

            const rewardsAccumulated = getRewardsAccumulated({
                usdcPrice,
                totalEarn: formattedEarnBalance,
                totalSvn: formattedSvnBalance
            })

            const saveTokenGlobalStake = saveTokenHolders && saveTokenHolders.reduce((total, holder) => {

                if (holder.owner_address.toLowerCase() === String(process.env.GO_DISTRIBUTER).toLowerCase()) {
                    return total
                }

                return total + Number(holder.balance_formatted)
            }, 0).toString() || "0.0000000000"


            const userTotalEarnTokenRewardsReceived = userSnapshots.snapshots.reduce((total, snapshot) => {
                if (snapshot.status === 3) {
                    return total + Number(snapshot.reward)
                }
                return total
            }, 0).toFixed(10)

            //calculate the balances
            const currentBalanceArray = calculateBalanceArray({ currencyExchangeRate, balance: currentBalance })
            const rewardsAccumulatedBalanceArray = calculateBalanceArray({ currencyExchangeRate, balance: rewardsAccumulated })

            //restructure the data
            const data = {
                liquid_staking: {
                    snapshot: {
                        next_snapshot: currentSnapshot[0].end_date.toString(),
                        current_stake: userWallet.snapshots.length > 0 ? userWallet.snapshots[0].stake && userWallet.snapshots[0].stake : "0.0000000000",
                        reward: userWallet.snapshots.length > 0 ? userWallet.snapshots[0].reward : "0.0000000000",
                        status: userWallet.snapshots.length > 0 ? userWallet.snapshots[0].status : 4,
                    },
                    wallet: userWallet.wallet,
                    currentBalances: currentBalanceArray,
                    current_save_balance: formattedSaveBalance,
                    current_usdc_balance: formattedUsdcBalance,
                    global_stake: saveTokenGlobalStake,
                    usdcPrice
                },
                grow_rewards: {
                    current_earn_balance: formattedEarnBalance,
                    current_svn_balance: formattedSvnBalance,
                    rewardsAccumulated: rewardsAccumulatedBalanceArray,
                    upcoming_reward: userWallet.snapshots.length > 0 ? userWallet.snapshots[0].reward : "0.0000000000",
                    total_reward_received: userTotalEarnTokenRewardsReceived
                }
            }

            return data

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
    getGoTokenBalanceHistory: publicProcedure.query(async () => {

        try {

            await rateLimiter.consume(1)

            const session = await getAuth()
            if (!session) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            await getMoralis()

            const getGoTokenBalanceHistory = await Moralis.EvmApi.token.getWalletTokenTransfers({
                chain: process.env.CHAIN,
                order: "ASC",
                address: session.user.wallet,
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
                    type: history.toAddress.lowercase === session.user.wallet.toLowerCase() ? 'Deposit' : 'Withdrawal',
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
    getUserSnapshotHistory: publicProcedure.input(z.string()).query(async (opts) => {

        try {

            await rateLimiter.consume(1)

            const walletAddress = opts.input

            const getUserSnapshotHistory = await db.user.findUnique({
                where: { wallet: walletAddress },
                select: {
                    snapshots: {
                        select: {
                            id: true,
                            stake: true,
                            status: true,
                            reward: true,
                            snapshot: {
                                select: {
                                    start_date: true,
                                    end_date: true
                                }
                            }
                        },
                        orderBy: {
                            created_at: 'asc'
                        }
                    }
                }
            })
            if (!getUserSnapshotHistory) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Failed to get user snapshot history"
            })

            const snapshotHistory = getUserSnapshotHistory.snapshots
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

    })
}