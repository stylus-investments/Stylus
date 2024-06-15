import { ORDERSTATUS } from "@/constant/order";
import db from "@/db/db";
import { getAuth } from "@/lib/nextAuth";
import { rateLimiter } from "@/lib/ratelimiter";
import { publicProcedure } from "@/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const orderRoute = {
    getAll: publicProcedure.query(async () => {

        await rateLimiter.consume(1)

        const session = await getAuth()
        if (!session) throw new TRPCError({
            code: 'UNAUTHORIZED'
        })

        return await db.user_order.findMany({
            include: {
                user: true
            },
            orderBy: {
                created_at: "desc"
            }
        })

    }),
    getCurrentUserOrder: publicProcedure.query(async () => {

        await rateLimiter.consume(1)

        const session = await getAuth()
        if (!session) throw new TRPCError({
            code: 'UNAUTHORIZED'
        })

        const user = await db.user.findUnique({
            where: { wallet: session.user.wallet }, select: {
                orders: true
            }
        })
        if (!user) throw new TRPCError({
            code: 'NOT_FOUND',
            message: "User Not Found"
        })

        return user.orders

    }),
    createOrder: publicProcedure.input(z.object({
        data: z.object({
            amount: z.string(),
            receipt: z.string(),
            method: z.string(),
            currency: z.string(),
            price: z.string(),
            transaction_id: z.string(),
        })
    })).mutation(async (opts) => {

        await rateLimiter.consume(1)

        const session = await getAuth()
        if (!session) throw new TRPCError({
            code: 'UNAUTHORIZED'
        })

        const userWallet = session.user.wallet

        const user = await db.user.findUnique({
            where: { wallet: userWallet }, include: {
                orders: {
                    select: {
                        status: true
                    }
                }
            }
        })

        if (!user) throw new TRPCError({
            code: 'NOT_FOUND',
            message: "User Not found"
        })

        const { data } = opts.input

        //if user has pending order don't allow to create one
        const hasProcessingOrder = user.orders.some(order => order.status === ORDERSTATUS['processing']);
        if (hasProcessingOrder) throw new TRPCError({
            code: 'BAD_REQUEST',
            message: "You cannot perform this action because you have a processing order."
        });

        //check if user is a dumbass
        const invalidOrdersCount = user.orders.filter(order => order.status === ORDERSTATUS['invalid']).length
        if (invalidOrdersCount >= 5) throw new TRPCError({
            code: 'BAD_REQUEST',
            message: "You have reached the maximum number of invalid orders."
        })

        const createOrder = await db.user_order.create({
            data: {
                ...data,
                status: ORDERSTATUS['processing'],
                user: {
                    connect: {
                        id: user.id
                    }
                }
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