import { publicProcedure } from "@/trpc/trpc";
import db from "@/db/db";
import { getSession } from "@/lib/lib";
import { getMoralis, getTokenHolders } from "@/lib/moralis";
import { TRPCError } from "@trpc/server";
import Moralis from "moralis";
import { z } from "zod";
const goTokenAddress = process.env.GO_ADDRESS as string

export const dashboardRoute = {
    getLiquidStaking: publicProcedure.query(async () => {
        try {

            const session = await getSession()

            if (!session.address) throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: "Unauthorized"
            })

            await getMoralis()


            const [userToken, goTokenHolders, currentSnapshot] = await Promise.all([
                Moralis.EvmApi.token.getWalletTokenBalances({
                    chain: process.env.CHAIN,
                    address: session.address
                }),
                getTokenHolders(),
                db.snapshot.findMany({
                    where: {
                        completed: false
                    }
                }),
                db.user.findUnique({
                    where: { wallet: session.address },
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

            if (!currentSnapshot) {
                session.destroy()
                await session.save()
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found"
                })
            }
            if (!userToken) throw new TRPCError({
                code: 'BAD_REQUEST',
                message: "Failed to get user token"
            })
            if (!goTokenHolders) throw new TRPCError({
                code: 'BAD_REQUEST',
                message: "Failed to get token holders"
            })


            const userTokenData = userToken.raw.filter(token => token.token_address.toLowerCase() === goTokenAddress.toLowerCase())[0] as any

            const balance = userTokenData && userTokenData.balance
            const decimals = userTokenData && userTokenData.decimals

            const getFormattedBalance = () => {
                if (balance && decimals) {
                    const formatBalance = Number(balance) / (10 ** decimals)
                    return formatBalance.toString()
                }
                return "0.0000000000"
            }

            const formattedBalance = getFormattedBalance()
            const goTokenGlobalStake = goTokenHolders && goTokenHolders.reduce((total, holder) => {

                if (holder.owner_address.toLowerCase() === String(process.env.GO_DISTRIBUTER).toLowerCase()) {

                    return total
                }

                return total + Number(holder.balance_formatted)
            }, 0).toString() || "0.0000000000"

            const userWallet = await db.user.findUnique({
                where: { wallet: session.address },
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
            })
            if (!userWallet) throw new TRPCError({
                code: 'NOT_FOUND',
                message: "User Not Found"
            })

            let user: {
                wallet: string
                current_go_balance: string
                snapshot: {
                    current_stake: string
                    reward: string
                    status: number
                }
            }

            let next_snapshot: string

            if (currentSnapshot.length > 0) {
                next_snapshot = currentSnapshot[0].end_date.toString()
            } else {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);
                next_snapshot = tomorrow.toString();
            }

            if (userWallet.snapshots.length > 0) {
                user = {
                    wallet: userWallet.wallet,
                    current_go_balance: formattedBalance,
                    snapshot: {
                        current_stake: userWallet.snapshots[0].stake && userWallet.snapshots[0].stake,
                        reward: userWallet.snapshots[0].reward,
                        status: userWallet.snapshots[0].status
                    }
                }
            } else {
                user = {
                    wallet: userWallet.wallet,
                    current_go_balance: formattedBalance,
                    snapshot: {
                        current_stake: "0.0000000000",
                        reward: "0.0000000000",
                        status: 4
                    }
                }
            }

            const data = {
                user,
                next_snapshot,
                global_stake: goTokenGlobalStake,
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