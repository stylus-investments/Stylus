import db from "@/db/db";
import { getAuth } from "@/lib/nextAuth";
import { getUserId } from "@/lib/privy";
import { publicProcedure } from "@/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { TRPCErrorResponse } from "@trpc/server/unstable-core-do-not-import";
import { equals } from "validator";
import { z } from "zod";

export const orderMessageRoute = {
    getOrderMessages: publicProcedure.input(z.object({
        orderID: z.string(),
        sender: z.string()
    })).query(async (opts) => {

        const { orderID, sender } = opts.input

        //retrieve order as well ass messages

        const order = await db.user_order.findUnique({
            where: { id: orderID },
            include: {
                order_message: {
                    select: {
                        content: true,
                        is_image: true,
                        sender: true,
                    }
                },
                user_investment_plan: {
                    select: {
                        total_price: true,
                        package: {
                            select: {
                                currency: true
                            }
                        }
                    }
                }
            }
        })
        if (!order) throw new TRPCError({
            code: "NOT_FOUND"
        })
        await db.user_order.update({
            where: { id: order.id },
            data: {
                user_unread_messages: sender === 'user' ? 0 : order.user_unread_messages,
                admin_unread_messages: sender === 'admin' ? 0 : order.admin_unread_messages,
            }
        })

        await db.$disconnect()

        return order

    }),
    sendOrderMessage: publicProcedure.input(z.object({
        orderID: z.string(),
        content: z.string(),
        is_image: z.boolean(),
        sender: z.string()
    })).mutation(async (opts) => {

        const { orderID, content, is_image, sender } = opts.input

        if (sender === 'admin') {
            const auth = await getAuth()
            if (!auth) throw new TRPCError({
                code: "UNAUTHORIZED"
            })
        } else {
            const user = await getUserId()
            if (!user) throw new TRPCError({
                code: "UNAUTHORIZED"
            })
        }

        const order = await db.user_order.findUnique({ where: { id: orderID } })
        if (!order) throw new TRPCError({
            code: "NOT_FOUND"
        })

        if (order.closed) throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This conversation is closed."
        })

        await Promise.all([
            db.order_message.create({
                data: {
                    content, is_image, sender,
                    user_order: {
                        connect: {
                            id: orderID
                        }
                    }
                }
            }),
            db.user_order.update({
                where: {
                    id: order.id
                },
                data: {
                    user_unread_messages: sender === 'admin' ? order.user_unread_messages + 1 : 0,
                    admin_unread_messages: sender === 'user' ? order.admin_unread_messages + 1 : 0,
                }
            })
        ])

        await db.$disconnect()

        return true
    }),
    updateUnreadMessage: publicProcedure.input(z.object({
        orderID: z.string().min(1, "Order ID cannot be empty"),
        sender: z.string()
    })).mutation(async (opts) => {

        const { orderID, sender } = opts.input

        if (sender === 'admin') {
            const auth = await getAuth()
            if (!auth) throw new TRPCError({
                code: "UNAUTHORIZED"
            })
        } else {
            const user = await getUserId()
            if (!user) throw new TRPCError({
                code: "UNAUTHORIZED"
            })
        }

        const order = await db.user_order.findUnique({ where: { id: orderID } })
        if (!order) throw new TRPCError({
            code: "NOT_FOUND"
        })

        await db.user_order.update({
            where: {
                id: order.id
            },
            data: {
                user_unread_messages: sender === 'user' ? 0 : order.user_unread_messages,
                admin_unread_messages: sender === 'admin' ? 0 : order.admin_unread_messages,
            }
        })

        return true
    }),
    openMesageRequest: publicProcedure.input(z.object({
        orderID: z.string().min(1, "Order ID cannot be empty")
    })).mutation(async ({ input }) => {

        try {

            const user = await getUserId()
            if (!user) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            const order = await db.user_order.findUnique({
                where: { id: input.orderID }
            })
            if (!order) throw new TRPCError({
                code: "NOT_FOUND",
                message: "Order not found"
            })
            if (order.user_id !== user) throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "This order does not belong to you."
            })

            //update order
            const requestOpenChat = await db.user_order.update({
                where: { id: order.id }, data: {
                    request_chat: true
                }
            })
            if (!requestOpenChat) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Something went wrong when requesting to update the order"
            })

            return true

        } catch (error) {
            if (error instanceof TRPCError) {
                throw error; // Re-throw TRPCError without modification
            }
            console.log(error)
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Server error"
            })
        } finally {
            await db.$disconnect()
        }
    })
}