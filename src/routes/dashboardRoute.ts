import { publicProcedure } from "@/app/server/trpc";
import db from "@/db/db";
import { getMoralis, getSession } from "@/lib/lib";
import { TRPCError } from "@trpc/server";
import Moralis from "moralis";

const goTokenAddress = process.env.GO_ADDRESS as string

export const dashboardRoute = {
    get: publicProcedure.query(async () => {
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

            let snapshot_date = {
                next: '',
                start: ''
            }

            if (currentSnapshot.length > 0) {
                snapshot_date.start = currentSnapshot[0].start_date.toString()
                snapshot_date.next = currentSnapshot[0].end_date.toString()
            } else {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);
                snapshot_date.next = tomorrow.toString();
                snapshot_date.start = tomorrow.toString();
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
                user, snapshot_date,
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
    })
}