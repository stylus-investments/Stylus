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
    getAllOrder: publicProcedure.input(z.string()).query(async (opts) => {

        const auth = await getAuth()
        if (!auth) throw new TRPCError({
            code: 'UNAUTHORIZED'
        })

        return await db.user_order.findMany({
            where: {
                status: opts.input
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

        return updateOrder
    }),
    completeOrder: publicProcedure.input(z.string()).mutation(async (opts) => {

        await rateLimiter.consume(1)

        const orderID = opts.input
        if (!orderID) throw new TRPCError({
            code: 'NOT_FOUND'
        })

        const order = await db.user_order.findUnique({
            where: { id: orderID }, select: {
                id: true,
                user_id: true,
                user_investment_plan: {
                    select: {
                        id: true,
                        base_price: true,
                    }
                }
            }
        })
        if (!order) throw new TRPCError({
            code: 'NOT_FOUND',
            message: "Order not found"
        })

        // if (order.status !== ORDERSTATUS['processing']) throw new TRPCError({
        //     code: 'BAD_REQUEST',
        //     message: "This order is invalid or paid"
        // })

        const updateOrder = await db.user_order.update({
            where: { id: order.id },
            data: { status: ORDERSTATUS['paid'] }
        })
        if (!updateOrder) throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Failed to update order"
        })

        const orderBasePrice = order.user_investment_plan.base_price
        const primaryInviterCommission = orderBasePrice * 0.03
        const secondaryInviterCommission = orderBasePrice * 0.02

        //give referrals commission
        const primaryUser = await db.referral_info.findUnique({
            where: { user_id: order.user_id }, include: {
                user_info: {
                    include: {
                        inviter_reward: true
                    }
                }
            }
        })
        if (!primaryUser) throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found"
        })

        //update total_invites in referral_info
        const userpaidOrders = await db.user_order.findMany({
            where: {
                user_id: order.user_id,
                status: ORDERSTATUS['paid']
            }
        })

        if (primaryUser.inviter_referral_code) {

            const [_, secondaryUser] = await Promise.all([
                // Increase the primary inviter's user referral reward
                db.referral_reward.update({
                    where: {
                        user_invited_id: primaryUser.user_id
                    }, data: {
                        reward: primaryUser.user_info.inviter_reward[0].reward + primaryInviterCommission
                    }
                }),
                // Update the primary inviter's unclaimed reward
                db.referral_info.update({
                    where: {
                        referral_code: primaryUser.inviter_referral_code
                    },
                    data: {
                        unclaimed_reward: {
                            increment: primaryInviterCommission
                        },
                        total_reward: {
                            increment: primaryInviterCommission
                        }
                    },
                    include: {
                        user_info: {
                            include: {
                                inviter_reward: true
                            }
                        }
                    }
                })
            ])
            if (!secondaryUser) throw new TRPCError({
                code: "NOT_FOUND",
                message: "Secondary User not found"
            })

            if (userpaidOrders.length === 1 && primaryUser.inviter_referral_code) {

                await db.referral_info.update({
                    where: {
                        referral_code: primaryUser.inviter_referral_code
                    },
                    data: {
                        total_invites: {
                            increment: 1
                        }
                    }
                })
            }


            if (secondaryUser.inviter_referral_code) {

                // Update their unclaimed_reward based on order.base_price
                await Promise.all([

                    // Update the secondary inviter's unclaimed reward
                    db.referral_info.update({
                        where: {
                            referral_code: secondaryUser.inviter_referral_code
                        },
                        data: {
                            unclaimed_reward: {
                                increment: secondaryInviterCommission
                            },
                            total_reward: {
                                increment: secondaryInviterCommission
                            }
                        }
                    }),

                    // Increase the secondary inviter's user referral reward
                    db.referral_reward.update({
                        where: {
                            user_invited_id: secondaryUser.user_id
                        }, data: {
                            reward: {
                                increment: secondaryInviterCommission
                            }
                        }
                    }),
                ])


                if (userpaidOrders.length === 1 && secondaryUser.inviter_referral_code) {

                    await db.referral_info.update({
                        where: {
                            referral_code: secondaryUser.inviter_referral_code
                        },
                        data: {
                            total_invites: {
                                increment: 1
                            }
                        }
                    })
                }
            }

        }

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

        // if (order.status !== ORDERSTATUS['processing']) throw new TRPCError({
        //     code: 'BAD_REQUEST',
        //     message: "This order is invalid or paid"
        // })

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