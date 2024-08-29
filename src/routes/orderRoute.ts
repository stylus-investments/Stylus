import { ORDERSTATUS } from "@/constant/order";
import db from "@/db/db";
import { getAuth } from "@/lib/nextAuth";
import { getUserId } from "@/lib/privy";
import { rateLimiter } from "@/lib/ratelimiter";
import { publicProcedure } from "@/trpc/trpc";
import { TRPCError } from "@trpc/server";
import axios from "axios";
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
            receipt: z.string(),
            method: z.string(),
            investment_plan_id: z.string()
        })
    })).mutation(async (opts) => {

        await rateLimiter.consume(1)

        const user = await getUserId()
        if (!user) throw new TRPCError({
            code: 'UNAUTHORIZED'
        })

        const { data } = opts.input

        const [investmentPlan, index] = await Promise.all([
            db.user_investment_plan.findUnique({
                where: { id: data.investment_plan_id }, include: {
                    package: {
                        select: {
                            currency: true
                        }
                    }
                }
            }),
            axios.get(`${process.env.NEXTAUTH_URL}/api/trpc/token.getIndexPrice`)
        ])
        if (!investmentPlan) throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This plan does not exist"
        })

        const stxBtcAmount = (investmentPlan.total_price / index.data as number)

        if (!user) throw new TRPCError({
            code: 'NOT_FOUND',
            message: "User Not found"
        })

        const createOrder = await db.user_order.create({
            data: {
                ...data,
                amount: stxBtcAmount.toFixed(6),
                status: ORDERSTATUS['processing'],
                user_id: user,
                user_investment_plan: {
                    connect: {
                        id: data.investment_plan_id
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

    }),
    updateOrder: publicProcedure.mutation(async () => {

        await rateLimiter.consume(1)

        const now = new Date();

        // Fetch orders created exactly 60 minutes ago or later
        await Promise.all([
            db.user_order.updateMany({
                where: {
                    status: ORDERSTATUS['processing'],
                    created_at: {
                        lte: new Date(now.getTime() - 60 * 60 * 1000) // Orders created at least 1 hour ago
                    }
                },
                data: {
                    status: ORDERSTATUS['invalid'],
                }
            }),
            db.user_order.updateMany({
                where: {
                    status: ORDERSTATUS['invalid'],
                    created_at: {
                        lte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Orders created at least 1 day ago
                    }
                },
                data: {
                    closed: true
                }
            })
        ])

        await db.$disconnect()
        return true
    }),
    toggleOrderConversation: publicProcedure.input(z.string()).mutation(async (opts) => {

        try {

            const auth = await getAuth()
            if (!auth) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            const order = await db.user_order.findUnique({ where: { id: opts.input } })
            if (!order) throw new TRPCError({
                code: "NOT_FOUND"
            })

            const updateOrder = await db.user_order.update({
                where: { id: order.id }, data: {
                    closed: !order.closed
                }
            })
            if (!updateOrder) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Failed to toggle order conversation"
            })

            return true

        } catch (error: any) {
            console.log(error);
            throw new TRPCError({
                code: error.code || "INTERNAL_SERVER_ERROR"
            })
        } finally {
            await db.$disconnect()
        }

    })
}