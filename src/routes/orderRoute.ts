import { ORDERSTATUS, PAYMENT_METHOD } from "@/constant/order";
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

        return await db.user_order.findMany({
            where: {
                status: {
                    not: ORDERSTATUS['unpaid']
                }
            }
        })

    }),
    createOrders: publicProcedure.query(async () => {
        try {

            await rateLimiter.consume(1)

            const now = new Date()

            const plans = await db.user_investment_plan.findMany({
                where: {
                    next_order_creation: {
                        lte: now
                    },
                },
                select: {
                    id: true,
                    user_id: true
                }
            })

            if (plans.length > 0) {

                const ordersData = plans.map(plan => ({
                    amount: 'Pay First.',
                    user_id: plan.user_id,
                    status: ORDERSTATUS['unpaid'],
                    receipt: '/qrpay.webp',
                    method: PAYMENT_METHOD['GCASH'],
                    user_investment_plan_id: plan.id
                }));

                const nextMonth = new Date(now.setMonth(now.getMonth() + 1));
                nextMonth.setHours(0, 0, 0, 0);
                await db.user_order.createMany({
                    data: ordersData
                })

                await db.user_investment_plan.updateMany({
                    where: {
                        id: {
                            in: plans.map(plan => plan.id)
                        }
                    },
                    data: {
                        next_order_creation: nextMonth
                    }
                })
            }

            return true

        } catch (error: any) {
            console.log(error);
            throw new TRPCError({
                code: error.code || "INTERNAL_SERVER_ERROR",
                message: error.message || "Server error"
            })
        } finally {
            await db.$disconnect()
        }
    }),
    payOrder: publicProcedure.input(z.object({
        data: z.object({
            receipt: z.string(),
            method: z.string(),
            order_id: z.string(),
        })
    })).mutation(async (opts) => {

        await rateLimiter.consume(1)

        const user = await getUserId()
        if (!user) throw new TRPCError({
            code: 'UNAUTHORIZED'
        })

        const { data } = opts.input

        const order = await db.user_order.findUnique({
            where: {
                id: data.order_id
            }
        })
        if (!order) throw new TRPCError({
            code: 'NOT_FOUND',
            message: "Order not found"
        })

        const [investmentPlan, index] = await Promise.all([
            db.user_investment_plan.findUnique({
                where: { id: order.user_investment_plan_id }
            }),
            axios.get(`${process.env.NEXTAUTH_URL}/api/trpc/token.getIndexPrice`)
        ])
        if (!investmentPlan) throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This plan does not exist"
        })

        const stxBtcAmount = (investmentPlan.total_price / index.data.result.data as number)

        const now = new Date()

        const updateOrder = await db.user_order.update({
            where: {
                id: opts.input.data.order_id
            },
            data: {
                receipt: data.receipt,
                method: data.method,
                created_at: now,
                amount: stxBtcAmount.toFixed(6),
                status: ORDERSTATUS['processing']
            }
        })
        if (!updateOrder) throw new TRPCError({
            code: 'BAD_REQUEST',
            message: "Failed to pay order"
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