import db from "@/db/db";
import { getAuth } from "@/lib/nextAuth";
import { getUserId } from "@/lib/privy";
import { publicProcedure } from "@/trpc/trpc";
import { TRPCError } from "@trpc/server";
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
            include: { order_message: true }
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
        orderID: z.string(),
        sender: z.string()
    })).query(async (opts) => {

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
    })
}