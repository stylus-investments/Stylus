import { publicProcedure } from "@/trpc/trpc";
import db from "@/db/db";
import { okayRes } from "@/lib/apiResponse";
import { getTokenHolders } from "@/lib/moralis";
import { TRPCError } from "@trpc/server";
import { rateLimiter } from "@/lib/ratelimiter";
import { privy } from "@/lib/privy";

export const snapshotRoute = {
    getAll: publicProcedure.query(async () => {

    }),
    reset: publicProcedure.query(async () => {
        try {
            await rateLimiter.consume(1);

            // Retrieve previous snapshots
            const previousSnapshots = await db.snapshot.findMany({
                where: { completed: false },
                orderBy: { created_at: 'desc' },
                take: 1 // Retrieve only the most recent snapshots needed
            });

            // Retrieve token holders and users
            const [tokenHolders, users] = await Promise.all([
                getTokenHolders(),
                privy.getUsers()
            ]);

            if (!tokenHolders || !users) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: "Failed to retrieve data"
                });
            }

            const userWalletMap = new Map(users.map(user => [user.wallet?.address.toLowerCase(), user]));
            const userIdMap = new Map(users.map(user => [user.id, user]));
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
                        include: { user_snapshot: true }
                    });

                    const updateZeroRewardIds: number[] = [];
                    const updatePendingRewardIds: number[] = [];

                    // Process user snapshots and collect IDs for bulk updates
                    updatedSnapshot.user_snapshot.map(usrSnapshot => {
                        const user = userIdMap.get(usrSnapshot.user_id);
                        const tokenHolder = user?.wallet ? tokenHolderMap.get(user.wallet.address.toLowerCase()) : null;

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

                    const userSnapshots = tokenHolders.map(holder => {
                        const user = userWalletMap.get(holder.owner_address.toLowerCase());
                        if (user) {
                            const reward = (Number(holder.balance_formatted) * 0.005).toFixed(8); // 0.5% reward
                            return {
                                stake: Number(holder.balance_formatted).toString(),
                                reward,
                                status: 1,
                                user_id: user.id,
                                snapshot_id: newSnapshot.id
                            };
                        }
                        return null;
                    }).filter(snapshot => snapshot !== null)

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

                const userSnapshots = tokenHolders.map(holder => {
                    const user = userWalletMap.get(holder.owner_address.toLowerCase());
                    if (user) {
                        const reward = (Number(holder.balance_formatted) * 0.005).toFixed(8); // 0.5% reward
                        return {
                            stake: Number(holder.balance_formatted).toString(),
                            reward,
                            status: 1,
                            user_id: user.id,
                            snapshot_id: newSnapshot.id
                        };
                    }
                    return null;
                }).filter(snapshot => snapshot !== null)

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