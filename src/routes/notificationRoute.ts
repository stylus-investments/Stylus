import db from "@/db/db";
import { getAuth } from "@/lib/nextAuth";
import { getUserId } from "@/lib/privy";
import { publicProcedure } from "@/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const notificationRoute = {
    getNotifications: publicProcedure.query(async () => {
        try {

            const user = await getUserId()
            if (!user) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            const userNotifications = await db.user_info.findUnique({
                where: { user_id: user }, select: {
                    user_notification: {
                        take: 5,
                        orderBy: {
                            updated_at: 'desc'
                        }
                    }
                },
            })
            if (!userNotifications) throw new TRPCError({
                code: "NOT_FOUND",
                message: "User not found"
            })

            return userNotifications.user_notification.map(notif => ({
                ...notif,
                created_at: notif.created_at.toISOString(),
                updated_at: notif.updated_at.toISOString()
            }))

        } catch (error: any) {
            console.log(error);
            throw new TRPCError({
                code: error.code || "INTERNAL_SERVER_ERROR",
                message: error.message || "Server Error"
            })
        } finally {
            await db.$disconnect()
        }
    }),
    pokeUser: publicProcedure.input(z.object({
        user_id: z.string()
    })).mutation(async ({ input }) => {

        try {

            const user = await getUserId()
            if (!user) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            const userInfo = await db.user_info.findUnique({ where: { user_id: user } })
            if (!userInfo) throw new TRPCError({
                code: "NOT_FOUND"
            })

            const sendNotif = await db.user_notification.create({
                data: {
                    user: {
                        connect: {
                            user_id: input.user_id
                        }
                    },
                    from: `${userInfo.first_name} ${userInfo.last_name}`,
                    message: "You have unpaid orders, Please pay."
                }
            })
            if (!sendNotif) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Failed to send notifications"
            })

            return sendNotif

        } catch (error: any) {
            console.log(error);
            throw new TRPCError({
                code: error.code || "INTERNAL_SERVER_ERROR",
                message: error.message || "Server Error"
            })
        } finally {
            await db.$disconnect()
        }
    }),
    seenNotif: publicProcedure.input(z.object({
        notif_id: z.string()
    })).mutation(async ({ input }) => {
        try {

            const user = await getUserId()
            if (!user) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            const seenNotif = await db.user_notification.update({
                where: {
                    id: input.notif_id
                },
                data: {
                    seen: true
                }
            })
            if (!seenNotif) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Failed to send notifications"
            })

            return true

        } catch (error: any) {
            console.log(error);
            throw new TRPCError({
                code: error.code || "INTERNAL_SERVER_ERROR",
                message: error.message || "Server Error"
            })
        } finally {
            await db.$disconnect()
        }
    }),
    readAllNotif: publicProcedure.mutation(async () => {
        try {

            const user = await getUserId()
            if (!user) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            const seenNotif = await db.user_notification.updateMany({
                where: {
                    user_id: user
                },
                data: {
                    seen: true
                }
            })
            if (!seenNotif) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Failed to send notifications"
            })

            return true

        } catch (error: any) {
            console.log(error);
            throw new TRPCError({
                code: error.code || "INTERNAL_SERVER_ERROR",
                message: error.message || "Server Error"
            })
        } finally {
            await db.$disconnect()
        }
    }),
    pushNotif: publicProcedure.input(z.object({
        user_id: z.string(),
        message: z.string(),
        from: z.string(),
        link: z.string().optional()
    })).mutation(async ({ input }) => {
        try {

            const auth = await getAuth()
            if (!auth) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            //check notif

            if (input.link) {
                const notif = await db.user_notification.findFirst({
                    where: {
                        link: input.link,
                        user_id: input.user_id
                    }
                })
                if (notif) {
                    //update the notif
                    await db.user_notification.update({
                        where: {
                            id: notif.id
                        }, data: {
                            seen: false,
                            times: {
                                increment: 1
                            }
                        }
                    })

                    return true
                }
            }

            const sendNotif = await db.user_notification.create({
                data: {
                    user: {
                        connect: {
                            user_id: input.user_id
                        }
                    },
                    from: input.from,
                    message: input.message,
                    link: input.link
                }
            })
            if (!sendNotif) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Failed to send notifications"
            })

        } catch (error: any) {
            console.log(error);
            throw new TRPCError({
                code: error.code || "INTERNAL_SERVER_ERROR",
                message: error.message || "Server Error"
            })
        } finally {
            await db.$disconnect()
        }
    })

}