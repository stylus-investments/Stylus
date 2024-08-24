
import { ORDERSTATUS } from "@/constant/order";
import db from "@/db/db";
import { getAuth } from "@/lib/nextAuth";
import { getUserId } from "@/lib/privy";
import { rateLimiter } from "@/lib/ratelimiter";
import { publicProcedure } from "@/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const orderRoute = {
    getAllOrder: publicProcedure.query(async () => {

        const auth = await getAuth()
        if (!auth) throw new TRPCError({
            code: 'UNAUTHORIZED'
        })

        return await db.user_order.findMany()

    }),
    getCurrentUserOrder: publicProcedure.query(async () => {

        await rateLimiter.consume(1)

        const user = await getUserId()

        if (!user) throw new TRPCError({
            code: "UNAUTHORIZED"
        })

        return await db.user_order.findMany({
            where: { user_id: user }
        })

    }),
    createOrder: publicProcedure.input(z.object({
        data: z.object({
            amount: z.string(),
            receipt: z.string(),
            method: z.string(),
            currency: z.string(),
            price: z.string(),
        })
    })).mutation(async (opts) => {

        await rateLimiter.consume(1)

        const user = await getUserId()
        if (!user) throw new TRPCError({
            code: 'UNAUTHORIZED'
        })

        const userOrders = await db.user_order.findMany({
            where: {
                user_id: user
            }
        })

        if (!user) throw new TRPCError({
            code: 'NOT_FOUND',
            message: "User Not found"
        })

        const { data } = opts.input

        //if user has pending order don't allow to create one
        const hasProcessingOrder = userOrders.some(order => order.status === ORDERSTATUS['processing']);
        if (hasProcessingOrder) throw new TRPCError({
            code: 'BAD_REQUEST',
            message: "You cannot perform this action because you have a processing order."
        });

        //check if user is a dumbass
        const invalidOrdersCount = userOrders.filter(order => order.status === ORDERSTATUS['invalid']).length
        if (invalidOrdersCount >= 5) throw new TRPCError({
            code: 'BAD_REQUEST',
            message: "You have reached the maximum number of invalid orders."
        })

        const createOrder = await db.user_order.create({
            data: {
                ...data,
                status: ORDERSTATUS['processing'],
                user_id: user
            }
        })

        if (!createOrder) throw new TRPCError({
            code: 'BAD_REQUEST',
            message: "Failed to create an order"
        })

        return true
    }),
    completeOrder: publicProcedure.input(z.string()).mutation(async (opts) => {

        await rateLimiter.consume(1)


        const orderID = opts.input
        if (!orderID) throw new TRPCError({
            code: 'NOT_FOUND'
        })

        const order = await db.user_order.findUnique({ where: { id: orderID } })
        if (!order) throw new TRPCError({
            code: 'NOT_FOUND',
            message: "Order not found"
        })

        if (order.status !== ORDERSTATUS['processing']) throw new TRPCError({
            code: 'BAD_REQUEST',
            message: "This order is invalid or completed"
        })

        const updateOrder = await db.user_order.update({
            where: { id: order.id },
            data: { status: ORDERSTATUS['completed'] }
        })
        if (!updateOrder) throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Failed to update order"
        })

        return true
    }),
    invalidOrder: publicProcedure.input(z.string()).mutation(async (opts) => {

        await rateLimiter.consume(1)

        const orderID = opts.input
        if (!orderID) throw new TRPCError({
            code: 'NOT_FOUND'
        })

        const order = await db.user_order.findUnique({ where: { id: orderID } })
        if (!order) throw new TRPCError({
            code: 'NOT_FOUND',
            message: "Order not found"
        })

        if (order.status !== ORDERSTATUS['processing']) throw new TRPCError({
            code: 'BAD_REQUEST',
            message: "This order is invalid or completed"
        })

        const updateOrder = await db.user_order.update({
            where: { id: order.id },
            data: { status: ORDERSTATUS['invalid'] }
        })
        if (!updateOrder) throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Failed to update order"
        })

        return true

    })
}