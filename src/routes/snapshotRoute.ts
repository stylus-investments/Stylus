import { publicProcedure } from "@/app/server/trpc";
import db from "@/db/db";
import { getTokenHolders, okayRes } from "@/lib/apiResponse";
import { getSession } from "@/lib/lib";
import { TRPCError } from "@trpc/server";
export const snapshotRoute = {
    get: publicProcedure.query(async () => {

        const session = await getSession()

        if (!session) throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: "Unauthorized"
        })

        const snapshots = await db.snapshot.findMany({
            include: {
                session: {
                    include: {
                        user: true
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

        return okayRes(snapshots)
    }),
    reset: publicProcedure.query(async () => {

        try {

            //retrieve previou snapshot
            const previousSnapshot = await db.snapshot.findMany({
                where: {
                    completed: false
                }
            })

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

            if (previousSnapshot.length > 0) {

                const end_date = new Date(previousSnapshot[0].end_date)
                end_date.setDate(end_date.getDate() + 1)

                const snapshotEndDate = new Date(previousSnapshot[0].end_date);

                if (snapshotEndDate <= now) {

                    //if this is true meaning the snapshot is completed
                    const updateSnapshot = await db.snapshot.update({
                        where: {
                            id: previousSnapshot[0].id
                        }, data: {
                            completed: true
                        },
                        include: {
                            session: {
                                include: {
                                    user: true
                                }
                            }
                        }
                    })

                    //retrieve all snapshot user
                    const sessions = updateSnapshot.session

                    await Promise.all(sessions.map(async (snapshotSession) => {

                        const tokenHolder = tokenHolders.find(holder => holder.owner_address === snapshotSession.user.wallet && snapshotSession.status === 1);

                        if (tokenHolder) {

                            if (Number(tokenHolder.balance_formatted) < Number(snapshotSession.stake)) {
                                //this mean user is disqualified
                                await db.snapshot_session.update({
                                    where: { id: snapshotSession.id }, data: { reward: '0.00', status: 0 }
                                })

                            } else {
                                //update the snapshot status into 2 means = "pending reward"
                                await db.snapshot_session.update({
                                    where: { id: snapshotSession.id }, data: { status: 2 }
                                })
                            }
                        }

                    }))

                    //create another snapshot session

                    const newSnapshot = await db.snapshot.create({
                        data: { start_date: previousSnapshot[0].end_date, end_date }
                    })
                    if (!newSnapshot) throw new TRPCError({
                        code: 'CLIENT_CLOSED_REQUEST',
                        message: "Failed to create new snapshot"
                    })

                    await Promise.all(tokenHolders.map(async (holder) => {

                        const user = users.find(user => user.wallet === holder.owner_address);

                        if (user) {

                            let reward
                            let stakeAmount

                            const previousSnapshot = await db.snapshot_session.findFirst({
                                where: {
                                    user: { id: user.id },
                                    snapshot: { end_date: { lt: now } }, // Filter previous snapshots
                                },
                                orderBy: { snapshot: { created_at: 'desc' } } // Order by end_date in descending order to get the most recent previous snapshot
                            });
                            if (previousSnapshot && previousSnapshot.status) {
                                reward = (Number(holder.balance_formatted) + Number(previousSnapshot.reward)) * (1.66 / 100)
                                stakeAmount = Number(holder.balance_formatted) + Number(previousSnapshot.reward)
                            } else {
                                reward = Number(holder.balance_formatted) * (1.66 / 100)
                                stakeAmount = Number(holder.balance_formatted)
                                //the reward will be 1.66% each snapshot
                            }

                            //create the session and connect it to snapshots
                            await db.snapshot_session.create({
                                data: {
                                    stake: stakeAmount.toFixed(2),
                                    reward: reward.toFixed(8),
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

                const end_date = new Date()
                end_date.setDate(now.getDate() + 1);
                end_date.setHours(0, 0, 0, 0);
                now.setHours(0, 0, 0, 0)

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

                        //create the session and connect it to snapshots
                        await db.snapshot_session.create({
                            data: {
                                stake: Number(holder.balance_formatted).toFixed(2),
                                reward: reward.toFixed(8),
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
}