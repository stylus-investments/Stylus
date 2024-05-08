import { publicProcedure } from "@/trpc/trpc";
import db from "@/db/db";
import { getMoralis, getTokenHolders } from "@/lib/moralis";
import { TRPCError } from "@trpc/server";
import Moralis from "moralis";
import { z } from "zod";
import { getAuth } from "@/lib/nextAuth";

const goTokenAddress = process.env.GO_ADDRESS as string
const growTokenAddress = process.env.GO_ADDRESS as string

export const dashboardRoute = {
    getLiquidStaking: publicProcedure.query(async () => {
        try {

            const session = await getAuth()

            if (!session) throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: "Unauthorized"
            })

            await getMoralis()


            const [userToken, goTokenHolders, currentSnapshot] = await Promise.all([
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
            ])
            if (!userToken) throw new TRPCError({
                code: 'BAD_REQUEST',
                message: "Failed to get user token"
            })
            if (!goTokenHolders) throw new TRPCError({
                code: 'BAD_REQUEST',
                message: "Failed to get token holders"
            })

            const getFormattedBalance = ({ balance, decimal }: any) => {
                if (balance && decimal) {
                    const formatBalance = Number(balance) / (10 ** decimal)
                    return formatBalance.toString()
                }
                return "0.0000000000"
            }

            /*
            Liquid Staking Data
            */

            const goUserTokenData = userToken.raw.filter(token => token.token_address.toLowerCase() === goTokenAddress.toLowerCase())[0] as any

            const goBalance = goUserTokenData && goUserTokenData.balance
            const goDecimal = goUserTokenData && goUserTokenData.decimals

            const formattedGoBalance = getFormattedBalance({
                balance: goBalance,
                decimal: goDecimal
            })

            const goTokenGlobalStake = goTokenHolders && goTokenHolders.reduce((total, holder) => {

                if (holder.owner_address.toLowerCase() === String(process.env.GO_DISTRIBUTER).toLowerCase()) {
                    return total
                }

                return total + Number(holder.balance_formatted)
            }, 0).toString() || "0.0000000000"



            const [userWallet, userSnapshots] = await Promise.all([
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
                })
            ])

            if (!userWallet || !userSnapshots) throw new TRPCError({
                code: 'NOT_FOUND',
                message: "User Not Found"
            })


            /* 
            Grow Rewards Data
            */

            const userTotalGrowRewardsReceived = userSnapshots.snapshots.reduce((total, snapshot) => {
                if (snapshot.status === 3) {
                    return total + Number(snapshot.reward)
                }
                return total
            }, 0).toFixed(10)

            const growUserTokenData = userToken.raw.filter(token => token.token_address.toLowerCase() === growTokenAddress.toLocaleLowerCase())[0] as any
            const growBalance = growUserTokenData && growUserTokenData.balance
            const growDecimal = growUserTokenData && growUserTokenData.decimals

            const formattedGrowBalance = getFormattedBalance({
                balance: growBalance,
                decimal: growDecimal
            })

            const data = {
                liquid_staking: {
                    snapshot: {
                        next_snapshot: currentSnapshot[0].end_date.toString(),
                        current_stake: userWallet.snapshots.length > 0 ? userWallet.snapshots[0].stake && userWallet.snapshots[0].stake : "0.0000000000",
                        reward: userWallet.snapshots.length > 0 ? userWallet.snapshots[0].reward : "0.0000000000",
                        status: userWallet.snapshots.length > 0 ? userWallet.snapshots[0].status : 4,
                    },
                    wallet: userWallet.wallet,
                    current_go_balance: formattedGoBalance,
                    global_stake: goTokenGlobalStake,
                },
                grow_rewards: {
                    current_grow_balance: formattedGrowBalance,
                    upcoming_reward: userWallet.snapshots.length > 0 ? userWallet.snapshots[0].reward : "0.0000000000",
                    total_reward_received: userTotalGrowRewardsReceived
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
    getGoTokenBalanceHistory: publicProcedure.input(String).query(async (opts) => {

        try {

            const walletAddress = opts.input

            await getMoralis()

            const getGoTokenBalanceHistory = await Moralis.EvmApi.token.getWalletTokenTransfers({
                chain: process.env.CHAIN,
                order: "ASC",
                address: walletAddress,
                contractAddresses: [process.env.GO_ADDRESS as string]
            })

            // console.log(getGoTokenBalanceHistory.raw)

            if (!getGoTokenBalanceHistory) throw new TRPCError({
                code: 'BAD_REQUEST',
                message: "Failed to get wallet go balance history"
            })

            const goTokenBalanceHistory = getGoTokenBalanceHistory.result
                .map((history, index) => ({
                    id: history.transactionHash,
                    date: history.blockTimestamp.toISOString(),
                    type: history.toAddress.lowercase === walletAddress.toLowerCase() ? 'Deposit' : 'Withdrawal',
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