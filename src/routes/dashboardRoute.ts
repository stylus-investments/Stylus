import { publicProcedure } from "@/app/server/trpc";
import db from "@/db/db";
import { getSession } from "@/lib/lib";
import { getMoralis } from "@/lib/moralis";
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

            const [userToken, goTokenData, currentSnapshot] = await Promise.all([
                Moralis.EvmApi.token.getWalletTokenBalances({
                    chain: process.env.CHAIN,
                    address: session.address
                }),
                Moralis.EvmApi.token.getTokenMetadata({
                    chain: process.env.CHAIN as string,
                    addresses: [goTokenAddress]
                }) as any,
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

            const userTokenData = userToken.raw.filter(token => token.token_address.toLowerCase() === goTokenAddress.toLowerCase())[0] as any

            const balance = userTokenData && userTokenData.balance
            const decimals = userTokenData && userTokenData.decimals

            const getFormattedBalance = () => {
                if (balance && decimals) {
                    const formatBalance = Number(balance) / (10 ** decimals)
                    return formatBalance.toFixed(2)
                }
                return "0.00"
            }

            const formattedBalance = getFormattedBalance()
            const goTokenTotalSupply = goTokenData.raw[0].total_supply_formatted

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
                        current_stake: "0.00",
                        reward: "0.00",
                        status: 4
                    }
                }
            }

            const data = {
                user,
                next_snapshot,
                global_stake: goTokenTotalSupply,
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
    getGoTokenBalanceHistory: publicProcedure.input(z.string()).query(async (opts) => {

        const walletAddress = opts.input

        const getGoTokenBalanceHistory = await Moralis.EvmApi.token.getWalletTokenTransfers({
            chain: process.env.CHAIN,
            order: "ASC",
            address: walletAddress
        })

        if (!getGoTokenBalanceHistory) throw new TRPCError({
            code: 'BAD_REQUEST',
            message: "Failed to get wallet go balance history"
        })

        const goTokenBalanceHistory = getGoTokenBalanceHistory.result
            .filter(history => history.contractAddress.lowercase === process.env.GO_ADDRESS?.toLowerCase())
            .map((history, index) => ({
                id: history.transactionHash,
                date: history.blockTimestamp.toISOString(),
                type: history.toAddress.lowercase === walletAddress ? 'Deposit' : 'Withdrawal',
                amount: (Number(history.value) / 10 ** 10).toFixed(2),
                month: index + 1
            }))
            .reverse()

        return goTokenBalanceHistory

    }),
    getUserSnapshotHistory: publicProcedure.input(z.string()).query(async (opts) => {
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

    })
}