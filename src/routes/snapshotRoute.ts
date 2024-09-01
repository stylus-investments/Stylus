import { publicProcedure } from "@/trpc/trpc";
import db from "@/db/db";
import { okayRes } from "@/lib/apiResponse";
import { getTokenHolders } from "@/lib/moralis";
import { TRPCError } from "@trpc/server";
import { rateLimiter } from "@/lib/ratelimiter";
import { getAuth } from "@/lib/nextAuth";
import { z } from "zod";

export const snapshotRoute = {
    getAllSnapshot: publicProcedure.query(async () => {

        try {

            await rateLimiter.consume(1);
            const snapshots = await db.snapshot.findMany({
                select: {
                    start_date: true,
                    id: true,
                    end_date: true,
                    completed: true,
                    user_snapshot: {
                        select: {
                            id: true,
                            status: true
                        }
                    }
                },
                orderBy: {
                    created_at: 'desc'
                }
            },)
            if (!snapshots) throw new TRPCError({
                code: 'BAD_REQUEST',
                message: "Failed to get all snapshots"
            })

            const modifySnapshotData = snapshots.map(snap => {

                const unpaidRemaining = snap.user_snapshot.reduce((total, snap) => {
                    return snap.status === 2 ? total + 1 : total
                }, 0)

                return {
                    ...snap,
                    start_date: snap.start_date.toISOString(),
                    end_date: snap.end_date.toISOString(),
                    user_snapshot: undefined,
                    total_holders: snap.user_snapshot.length || 0,
                    total_unpaid_holders: unpaidRemaining
                }
            }) as {
                total_holders: number;
                total_unpaid_holders: number;
                id: number;
                start_date: string;
                end_date: string;
                completed: boolean;
            }[]

            return modifySnapshotData

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
    getSnapshotData: publicProcedure.input(z.number()).query(async (opts) => {

        try {

            await rateLimiter.consume(1);

            const session = await getAuth()
            if (!session) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            const snapshotID = opts.input
            if (!snapshotID) throw new TRPCError({
                code: 'NOT_FOUND',
                message: "Snapshot ID not found"
            })

            const snapshot = await db.snapshot.findUnique({
                where: { id: snapshotID }, select: {
                    user_snapshot: {
                        select: {
                            id: true,
                            reward: true,
                            stake: true,
                            status: true,
                            wallet: true
                        }
                    }
                }
            })
            if (!snapshot) throw new TRPCError({
                code: "NOT_FOUND",
                message: "Snapshot not found"
            })

            return snapshot.user_snapshot

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
    updateUserSnapshots: publicProcedure.input(z.number()).mutation(async (opts) => {

        await rateLimiter.consume(1);

        try {

            const snapshotID = opts.input

            const session = await getAuth()
            if (!session) throw new TRPCError({
                code: 'UNAUTHORIZED'
            })

            const snapshot = await db.snapshot.findUnique({
                where: { id: snapshotID },
                include: {
                    user_snapshot: {
                        select: {
                            id: true
                        }
                    }
                }
            })
            if (!snapshot) throw new TRPCError({
                code: 'NOT_FOUND'
            })
            if (!snapshot.completed) throw new TRPCError({
                code: 'BAD_REQUEST',
                message: "Snapshot is not completed"
            })

            const updateUserSnapshots = await db.user_snapshot.updateMany({
                where: {
                    snapshot_id: snapshot.id,
                    status: 2
                }, data: {
                    status: 3
                }
            })
            if (!updateUserSnapshots) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Failed to update user snapshots"
            })

            return okayRes()

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
    reset: publicProcedure.mutation(async () => {

        try {
            await rateLimiter.consume(1);

            // Retrieve token holders and users
            const [tokenHolders, users, previousSnapshots] = await Promise.all([
                getTokenHolders(),
                db.user_info.findMany({
                    select: {
                        user_id: true,
                        wallet: true
                    }
                }),
                db.snapshot.findMany({
                    where: { completed: false },
                    orderBy: { created_at: 'desc' },
                    take: 1
                })
            ])

            if (!tokenHolders || !users) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: "Failed to retrieve data"
                });
            }

            const userWalletMap = new Map(users.map(user => [user.wallet.toLowerCase(), user]));
            const userIdMap = new Map(users.map(user => [user.user_id, user]));
            const tokenHolderMap = new Map(tokenHolders.map(holder => [holder.owner_address.toLowerCase(), holder]));

            const now = new Date();
            const previousSnapshot = previousSnapshots[0];
            const end_date = new Date(previousSnapshot ? previousSnapshot.end_date : now);
            end_date.setUTCDate(end_date.getUTCDate() + 1);
            end_date.setUTCHours(16, 0, 0, 0); // Set end_date to 4:00 PM UTC

            if (previousSnapshot) {
                if (new Date(previousSnapshot.end_date)) {

                    // Mark previous snapshot as completed
                    const updatedSnapshot = await db.snapshot.update({
                        where: { id: previousSnapshot.id },
                        data: { completed: true },
                        include: {
                            user_snapshot: {
                                select: {
                                    id: true,
                                    stake: true,
                                    user_id: true
                                }
                            }
                        }
                    });

                    const updateZeroRewardIds: number[] = [];
                    const updatePendingRewardIds: number[] = [];

                    // Process user snapshots and collect IDs for bulk updates
                    updatedSnapshot.user_snapshot.map(usrSnapshot => {
                        const user = userIdMap.get(usrSnapshot.user_id);
                        const tokenHolder = user?.wallet ? tokenHolderMap.get(user.wallet.toLowerCase()) : null;

                        if (tokenHolder) {
                            const stake = Number(usrSnapshot.stake);
                            const balance = Number(tokenHolder.balance_formatted);

                            if (balance < stake) {
                                updateZeroRewardIds.push(usrSnapshot.id);
                            } else {
                                updatePendingRewardIds.push(usrSnapshot.id);
                            }
                        }
                    });

                    // Perform batch updates if there are IDs to update
                    if (updateZeroRewardIds.length > 0) {

                        await db.user_snapshot.updateMany({
                            where: {
                                id: {
                                    in: updateZeroRewardIds
                                }
                            },
                            data: {
                                reward: '0.000000',
                                status: 0
                            }
                        });
                    }

                    if (updatePendingRewardIds.length > 0) {
                        await db.user_snapshot.updateMany({
                            where: {
                                id: {
                                    in: updatePendingRewardIds
                                }
                            },
                            data: {
                                status: 2
                            }
                        });
                    }

                    // Create a new snapshot
                    const newSnapshot = await db.snapshot.create({
                        data: { start_date: previousSnapshot.end_date, end_date }
                    });

                    const userSnapshots = tokenHolders.reduce((acc, holder) => {
                        const user = userWalletMap.get(holder.owner_address.toLowerCase());
                        if (user) {
                            const balance = Number(holder.balance_formatted).toString()
                            const reward = (Number(holder.balance_formatted) * 0.005).toFixed(8); // 0.5% reward
                            acc.push({
                                stake: balance,
                                reward,
                                status: 1,
                                wallet: user.wallet,
                                user_id: user.user_id,
                                snapshot_id: newSnapshot.id
                            });
                        }
                        return acc;
                    }, [] as {
                        stake: string
                        reward: string
                        status: number
                        wallet: string
                        user_id: string
                        snapshot_id: number
                    }[]);

                    // Insert all user snapshots in one go
                    if (userSnapshots.length > 0) {
                        await db.user_snapshot.createMany({
                            data: userSnapshots
                        });
                    }

                    return okayRes();

                } else {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'Snapshot still ongoing',
                    });
                }
            } else {
                // Create a new snapshot
                const newSnapshot = await db.snapshot.create({
                    data: { start_date: now, end_date }
                });

                const userSnapshots = tokenHolders.reduce((acc, holder) => {
                    const user = userWalletMap.get(holder.owner_address.toLowerCase());
                    if (user) {
                        const reward = (Number(holder.balance_formatted) * 0.005).toFixed(8); // 0.5% reward
                        acc.push({
                            stake: Number(holder.balance_formatted).toString(),
                            reward,
                            status: 1,
                            wallet: user.wallet,
                            user_id: user.user_id,
                            snapshot_id: newSnapshot.id
                        });
                    }
                    return acc;
                }, [] as {
                    stake: string
                    reward: string
                    status: number
                    wallet: string
                    user_id: string
                    snapshot_id: number
                }[]);

                // Insert all user snapshots in one go
                if (userSnapshots.length > 0) {
                    await db.user_snapshot.createMany({
                        data: userSnapshots
                    });
                }

                return okayRes();
            }

        } catch (error: any) {
            console.log(error);
            throw new TRPCError({
                code: error.code || 'INTERNAL_SERVER_ERROR',
                message: error.message || 'An unexpected error occurred'
            });
        } finally {
            await db.$disconnect();
        }
    })
}