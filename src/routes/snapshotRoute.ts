import { publicProcedure } from "@/trpc/trpc";
import db from "@/db/db";
import { okayRes } from "@/lib/apiResponse";
import { getTokenHolders } from "@/lib/moralis";
import { getAuth } from "@/lib/nextAuth";
import { TRPCError } from "@trpc/server";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { z } from 'zod'

const opts = {
    points: 1,
    duration: 1,
};

const rateLimiter = new RateLimiterMemory(opts);

export const snapshotRoute = {
    getAllSnapshot: publicProcedure.query(async () => {

        try {

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
                    user_snapshot: undefined,
                    total_holders: snap.user_snapshot.length || 0,
                    total_unpaid_holders: unpaidRemaining
                }
            })

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
    getSnapshotByID: publicProcedure.input(z.number()).query(async (opts) => {
        const snapshotID = opts.input

        const snapshot = await db.snapshot.findUnique({
            where: {
                id: snapshotID
            }
        })
        if (!snapshot) throw new TRPCError({
            code: 'NOT_FOUND'
        })

        return snapshot
    }),
    getData: publicProcedure.input(z.number()).query(async (opts) => {

        try {

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
                            user: {
                                select: {
                                    wallet: true
                                }
                            }
                        }
                    }
                }
            })
            if (!snapshot) throw new TRPCError({
                code: "NOT_FOUND",
                message: "Snapshot not found"
            })

            const modifySnapshotData = snapshot.user_snapshot.map(user_snapshot => ({
                ...user_snapshot,
                user: undefined,
                wallet: user_snapshot.user.wallet
            }))

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
                db.user.findMany()
            ])

            if (!tokenHolders) throw new TRPCError({
                code: 'NOT_FOUND',
                message: "Failed to retrieve token holders"
            })
            if (!users) throw new TRPCError({
                code: "NOT_FOUND",
                message: "Faild to retrieve users"
            })

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
                            user_snapshot: {
                                include: {
                                    user: true
                                }
                            }
                        }
                    })

                    //retrieve all snapshot user
                    const user_snapshots = updateSnapshot.user_snapshot

                    await Promise.all(user_snapshots.map(async (usrSnapshot) => {

                        const tokenHolder = tokenHolders.find(holder => holder.owner_address === usrSnapshot.user.wallet && usrSnapshot.status === 1);

                        if (tokenHolder) {

                            if (Number(tokenHolder.balance_formatted) < Number(usrSnapshot.stake)) {
                                //this mean user is disqualified
                                const updateUserSnapshot = await db.user_snapshot.update({
                                    where: { id: usrSnapshot.id }, data: { reward: '0.00', status: 0 }
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

                    }))

                    //create another snapshot user_snapshot

                    const newSnapshot = await db.snapshot.create({
                        data: { start_date: previousSnapshots[0].end_date, end_date }
                    })
                    if (!newSnapshot) throw new TRPCError({
                        code: 'CLIENT_CLOSED_REQUEST',
                        message: "Failed to create new snapshot"
                    })

                    await Promise.all(tokenHolders.map(async (holder) => {

                        const user = users.find(user => user.wallet === holder.owner_address);

                        if (user) {

                            const reward = Number(holder.balance_formatted) * (1.66 / 100)

                            //create the user_snapshot and connect it to snapshots
                            const createUserSnapshot = await db.user_snapshot.create({
                                data: {
                                    stake: Number(holder.balance_formatted).toFixed(2),
                                    reward: reward.toFixed(2),
                                    status: 1,
                                    user: {
                                        connect: {
                                            id: user.id
                                        }
                                    },
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

                    const user = users.find(user => user.wallet === holder.owner_address);

                    if (user) {

                        //the reward will be 1.66% each snapshot
                        const reward = Number(holder.balance_formatted) * (1.66 / 100);

                        //create userSnapshot and connect it to snapshots
                        const createUserSnapshot = await db.user_snapshot.create({
                            data: {
                                stake: Number(holder.balance_formatted).toFixed(2),
                                reward: reward.toFixed(2),
                                status: 1,
                                user: {
                                    connect: {
                                        id: user.id
                                    }
                                },
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
    }),
    updateUserSnapshot: publicProcedure.input(z.number()).mutation(async (opts) => {

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

    })
}