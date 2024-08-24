import db from "@/db/db";
import { getAuth } from "@/lib/nextAuth";
import { getUserId } from "@/lib/privy";
import { pusherServer } from "@/lib/pusher";
import { publicProcedure } from "@/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const orderMessageRoute = {
    getOrderMessages: publicProcedure.input(z.string()).query(async (opts) => {

        const orderID = opts.input

        //retrieve order as well ass messages

        const order = await db.user_order.findUnique({
            where: { id: orderID },
            include: { order_message: true }
        })
        if (!order) throw new TRPCError({
            code: "NOT_FOUND"
        })

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

        pusherServer.trigger(orderID, 'incoming-message', {
            content,
            is_image,
            sender
        })

        const sendMessage = await db.order_message.create({
            data: {
                content, is_image, sender,
                user_order: {
                    connect: {
                        id: orderID
                    }
                }
            }
        })
        if (!sendMessage) throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Failed to send message"
        })

        return true
    })
}