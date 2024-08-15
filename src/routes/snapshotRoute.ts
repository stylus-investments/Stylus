import { publicProcedure } from "@/trpc/trpc";
import db from "@/db/db";
import { okayRes } from "@/lib/apiResponse";
import { getTokenHolders } from "@/lib/moralis";
import { TRPCError } from "@trpc/server";
import { rateLimiter } from "@/lib/ratelimiter";
import { privy } from "@/lib/privy";

export const snapshotRoute = {
    reset: publicProcedure.mutation(async () => {

        try {

            await rateLimiter.consume(1);

            //retrieve previou snapshot
            const previousSnapshots = await db.snapshot.findMany({
                where: {
                    completed: false
                },
                orderBy: {
                    created_at: 'desc'
                }
            })

            if (previousSnapshots.length > 1) {
                // Delete all snapshots except the first one
                const snapshotsToDelete = previousSnapshots.slice(1);

                await Promise.all(snapshotsToDelete.map(async (snapshot) => {

                    await db.user_snapshot.deleteMany({
                        where: {
                            snapshot_id: snapshot.id
                        }
                    });

                    await db.snapshot.delete({
                        where: {
                            id: snapshot.id
                        }
                    });
                }));
            }

            //retrieve token holders and users
            const [tokenHolders, users] = await Promise.all([
                getTokenHolders(),
                privy.getUsers()
            ])

            if (!tokenHolders) throw new TRPCError({
                code: 'NOT_FOUND',
                message: "Failed to retrieve token holders"
            })
            if (!users) throw new TRPCError({
                code: "NOT_FOUND",
                message: "Faild to retrieve users"
            })

            const userWalletMap = new Map(users.map(user => [user.wallet?.address.toLocaleLowerCase(), user]));
            const userIdMap = new Map(users.map(user => [user.id, user]));
            const tokenHolderMap = new Map(tokenHolders.map(user => [user.owner_address.toLocaleLowerCase(), user]))

            const now = new Date()

            if (previousSnapshots.length > 0) {

                const end_date = new Date(previousSnapshots[0].end_date)
                end_date.setUTCDate(end_date.getUTCDate() + 1)

                const previousSnapshotEndDate = new Date(previousSnapshots[0].end_date);

                if (previousSnapshotEndDate <= now) {

                    //if this is true meaning the snapshot is completed
                    const updateSnapshot = await db.snapshot.update({
                        where: {
                            id: previousSnapshots[0].id
                        }, data: {
                            completed: true
                        },
                        include: {
                            user_snapshot: true
                        }
                    })

                    //retrieve all snapshot user
                    const user_snapshots = updateSnapshot.user_snapshot

                    //update all snapshot check if the user is forfiet or not
                    await Promise.all(user_snapshots.map(async (usrSnapshot) => {

                        const user = userIdMap.get(usrSnapshot.user_id)

                        if (user?.wallet) {

                            const tokenHolder = tokenHolderMap.get(user.wallet.address.toLocaleLowerCase())

                            if (tokenHolder) {

                                if ((Number(tokenHolder.balance_formatted) < Number(usrSnapshot.stake))) {

                                    //this mean user is disqualified
                                    const updateUserSnapshot = await db.user_snapshot.update({
                                        where: { id: usrSnapshot.id }, data: { reward: '0.0000000000', status: 0 }
                                    })
                                    if (!updateUserSnapshot) throw new TRPCError({
                                        code: "BAD_REQUEST",
                                        message: "Failed to update user snapshot"
                                    })

                                } else {

                                    //update the snapshot status into 2 means = "pending reward"
                                    const updateUserSnapshot = await db.user_snapshot.update({
                                        where: { id: usrSnapshot.id }, data: { status: 2 }
                                    })
                                    if (!updateUserSnapshot) throw new TRPCError({
                                        code: "BAD_REQUEST",
                                        message: "Failed to update user snapshot"
                                    })

                                }
                            }

                        }
                    }))

                    //create another snapshot
                    const newSnapshot = await db.snapshot.create({
                        data: { start_date: previousSnapshots[0].end_date, end_date }
                    })
                    if (!newSnapshot) throw new TRPCError({
                        code: 'CLIENT_CLOSED_REQUEST',
                        message: "Failed to create new snapshot"
                    })

                    //connect all users in current snapshot if they have go balance
                    await Promise.all(tokenHolders.map(async (holder) => {

                        const user = userWalletMap.get(holder.owner_address.toLocaleLowerCase())


                        //if user is a token holder
                        if (user) {

                            const reward = Number(holder.balance_formatted) * (0.5 / 100)

                            //create the user_snapshot and connect it to snapshots
                            const createUserSnapshot = await db.user_snapshot.create({
                                data: {
                                    stake: Number(holder.balance_formatted).toString(),
                                    reward: reward.toFixed(8),
                                    status: 1,
                                    user_id: user.id,
                                    snapshot: {
                                        connect: {
                                            id: newSnapshot.id
                                        }
                                    }
                                }
                            })
                            if (!createUserSnapshot) throw new TRPCError({
                                code: 'BAD_REQUEST',
                                message: "Failed to create user snapshot"
                            })
                        }
                    }))

                    return okayRes()

                } else {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'Snapshot still ongoing',
                    });
                }

            } else {

                now.setUTCHours(16, 0, 0, 0); // Set now to 4:00 PM UTC
                const end_date = new Date(now)
                end_date.setUTCDate(now.getUTCDate() + 1); // Add a day to now
                end_date.setUTCHours(16, 0, 0, 0);

                const newSnapshot = await db.snapshot.create({
                    data: { start_date: now, end_date }
                })

                if (!newSnapshot) throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: "Failed to create new Snapshot"
                })

                await Promise.all(tokenHolders.map(async (holder) => {

                    const user = userWalletMap.get(holder.owner_address.toLocaleLowerCase())

                    if (user) {

                        //the reward will be 1.66% each snapshot
                        const reward = Number(holder.balance_formatted) * (0.5 / 100);

                        //create userSnapshot and connect it to snapshots
                        const createUserSnapshot = await db.user_snapshot.create({
                            data: {
                                stake: Number(holder.balance_formatted).toString(),
                                reward: reward.toFixed(10),
                                status: 1,
                                user_id: user.id,
                                snapshot: {
                                    connect: {
                                        id: newSnapshot.id
                                    }
                                }
                            }
                        })
                        if (!createUserSnapshot) throw new TRPCError({
                            code: 'BAD_REQUEST',
                            message: "Failed to create user snapshot"
                        })
                    }
                }))
                return okayRes()
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
    })
}