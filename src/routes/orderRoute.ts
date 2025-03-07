import { ORDER_TYPE, ORDERSTATUS } from "@/constant/order";
import db from "@/db/db";
import { getAuth } from "@/lib/nextAuth";
import { getUserId } from "@/lib/privy";
import { rateLimiter } from "@/lib/ratelimiter";
import { publicProcedure } from "@/trpc/trpc";
import { TRPCError } from "@trpc/server";
import axios from "axios";
import { z } from "zod";
import { Resend } from 'resend';
import { NewOrderEmailTemplate } from "@/components/emails/new-order";

const resend = new Resend(process.env.RESEND_API_KEY);

export const orderRoute = {
    getAllOrder: publicProcedure.input(z.object({
        page: z.string().min(1).optional().default('1'),
        status: z.string().optional(),
        request_chat: z.string().optional(),
    })).query(async ({ input }) => {

        const { page, status, request_chat } = input, limit = 8

        const auth = await getAuth()
        if (!auth) throw new TRPCError({
            code: 'UNAUTHORIZED'
        })

        const orders = await db.user_order.findMany({
            where: {
                status,
                request_chat: request_chat ? true : undefined
            },
            orderBy: { updated_at: 'desc' },
            skip: (Number(page) - 1) * limit, // Skip records for pagination
            take: limit
        })
        const totalOrders = await db.user_order.count({
            where: {
                status
            }
        });

        const hasNextPage = (Number(page) * limit) < totalOrders;
        const hasPreviousPage = Number(page) > 1;
        const totalPages = Math.ceil(totalOrders / limit);

        return {
            data: orders,
            pagination: {
                total: totalOrders,
                page,
                hasNextPage,
                hasPreviousPage,
                totalPages
            }
        };

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

        const stxBtcAmount = (investmentPlan.total_price / index.data.result.data.php as number)

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

        await resend.emails.send({
            from: 'New Order Processing <order@stylus.investments>',
            to: ['support@stylus.investments'],
            subject: 'New Order Processing',
            react: NewOrderEmailTemplate(),
        });

        return updateOrder
    }),
    completeOrder: publicProcedure.input(z.object({
        orderType: z.enum(Object.values(ORDER_TYPE) as [keyof typeof ORDER_TYPE]),
        orderID: z.string()
    })).mutation(async (opts) => {

        await rateLimiter.consume(1)

        const { orderID, orderType } = opts.input
        if (!orderID) throw new TRPCError({
            code: 'NOT_FOUND'
        })

        if (orderType === 'sbtc') {


            const order = await db.user_order.findUnique({
                where: { id: orderID }, select: {
                    id: true,
                    user_id: true,
                    status: true,
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

            if (order.status !== ORDERSTATUS['processing']) throw new TRPCError({
                code: 'BAD_REQUEST',
                message: "This order is invalid or paid"
            })

            const updateOrder = await db.user_order.update({
                where: { id: order.id },
                data: {
                    status: ORDERSTATUS['paid'],
                    user_investment_plan: {
                        update: {
                            where: {
                                id: order.user_investment_plan.id
                            },
                            data: {
                                payment_count: {
                                    decrement: 1
                                }
                            }
                        }
                    }
                }
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

            //notify user
            await db.user_notification.create({
                data: {
                    user: {
                        connect: {
                            user_id: order.user_id
                        }
                    },
                    message: "Your order has been successfully processed. Thank you!",
                    from: "Stylus Admin",
                    link: `/dashboard/wallet/plans/${order.user_investment_plan}`
                }
            })

        }

        if (orderType === 'sphp') {
            const order = await db.user_token_order.findUnique({
                where: { id: orderID }, select: {
                    id: true,
                    user_id: true,
                    status: true,

                }
            })
            if (!order) throw new TRPCError({
                code: 'NOT_FOUND',
                message: "Order not found"
            })

            if (order.status !== ORDERSTATUS['processing']) throw new TRPCError({
                code: 'BAD_REQUEST',
                message: "This order is invalid or paid"
            })

            const updateOrder = await db.user_token_order.update({
                where: { id: order.id },
                data: {
                    status: ORDERSTATUS['paid'],
                }
            })
            if (!updateOrder) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Failed to update order"
            })
        }


        return true
    }),
    invalidOrder: publicProcedure.input(z.object({
        orderID: z.string(),
        orderType: z.enum(Object.values(ORDER_TYPE) as [keyof typeof ORDER_TYPE]),

    })).mutation(async (opts) => {

        await rateLimiter.consume(1)

        const { orderID, orderType } = opts.input
        if (!orderID) throw new TRPCError({
            code: 'NOT_FOUND'
        })

        if (orderType === 'sbtc') {

            const order = await db.user_order.findUnique({ where: { id: orderID } })
            if (!order) throw new TRPCError({
                code: 'NOT_FOUND',
                message: "Order not found"
            })

            if (order.status !== ORDERSTATUS['processing']) throw new TRPCError({
                code: 'BAD_REQUEST',
                message: "This order is invalid or paid"
            })

            const updateOrder = await db.user_order.update({
                where: { id: order.id },
                data: { status: ORDERSTATUS['invalid'] }
            })
            if (!updateOrder) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Failed to update order"
            })

            await db.user_notification.create({
                data: {
                    user: {
                        connect: {
                            user_id: order.user_id
                        }
                    },
                    message: "Unfortunately, this order is not valid. Please check your information.",
                    from: "Stylus Admin"
                }
            })

        }

        if (orderType === 'sphp') {
            const order = await db.user_token_order.findUnique({ where: { id: orderID } })
            if (!order) throw new TRPCError({
                code: 'NOT_FOUND',
                message: "Order not found"
            })

            if (order.status !== ORDERSTATUS['processing']) throw new TRPCError({
                code: 'BAD_REQUEST',
                message: "This order is invalid or paid"
            })

            const updateOrder = await db.user_token_order.update({
                where: { id: order.id },
                data: { status: ORDERSTATUS['invalid'] }
            })
            if (!updateOrder) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Failed to update order"
            })

            await db.user_notification.create({
                data: {
                    user: {
                        connect: {
                            user_id: order.user_id
                        }
                    },
                    message: "Unfortunately, this order is not valid. Please check your information.",
                    from: "Stylus Admin"
                }
            })
        }


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
            }),

        ])

        const upcomingOrders = await db.user_order.findMany({
            where: {
                created_at: {
                    lte: now
                },
                user_investment_plan: {
                    payment_count: {
                        not: 0
                    }
                },
                status: ORDERSTATUS['upcoming']
            },
        })

        await Promise.all([
            db.user_order.updateMany({
                where: {
                    created_at: {
                        lte: now
                    },
                    user_investment_plan: {
                        payment_count: {
                            not: 0
                        }
                    },
                    status: ORDERSTATUS['upcoming']
                }, data: {
                    status: ORDERSTATUS['unpaid'],
                    amount: ORDERSTATUS['unpaid']
                }
            }),
            db.user_order.createMany({
                data: upcomingOrders.map(order => {
                    const orderDate = new Date(order.created_at)
                    const nextMonth = new Date(orderDate);
                    nextMonth.setMonth(orderDate.getMonth() + 1);
                    return {
                        amount: ORDERSTATUS['upcoming'], // Second order
                        user_id: order.user_id,
                        status: ORDERSTATUS['upcoming'],
                        method: ORDERSTATUS['upcoming'],
                        user_investment_plan_id: order.user_investment_plan_id,
                        created_at: nextMonth
                    }
                })
            })
        ])

        await db.$disconnect()

        return true
    }),
    toggleOrderConversation: publicProcedure.input(z.object({
        orderID: z.string(),
        orderType: z.enum(Object.values(ORDER_TYPE) as [keyof typeof ORDER_TYPE]),
    })).mutation(async (opts) => {

        try {

            await rateLimiter.consume(1)

            const { orderID, orderType } = opts.input
            const auth = await getAuth()
            if (!auth) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            if (orderType === 'sbtc') {


                const order = await db.user_order.findUnique({ where: { id: orderID } })
                if (!order) throw new TRPCError({
                    code: "NOT_FOUND"
                })

                if (order.closed && order.request_chat) {
                    await db.user_notification.create({
                        data: {
                            user: {
                                connect: {
                                    user_id: order.user_id,
                                }
                            },
                            message: "Your request to open a conversation has been approved.",
                            link: `/dashboard/wallet/plans/${order.user_investment_plan_id}`,
                            from: "Stylus Admin"
                        }
                    })
                }

                const updateOrder = await db.user_order.update({
                    where: { id: order.id }, data: {
                        closed: !order.closed
                        , request_chat: order.closed ? false : true
                    }
                })
                if (!updateOrder) throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Failed to toggle order conversation"
                })

            }
            if (orderType === 'sphp') {


                const order = await db.user_token_order.findUnique({ where: { id: orderID } })
                if (!order) throw new TRPCError({
                    code: "NOT_FOUND"
                })

                if (order.closed && order.request_chat) {
                    await db.user_notification.create({
                        data: {
                            user: {
                                connect: {
                                    user_id: order.user_id,
                                }
                            },
                            message: "Your request to open a conversation has been approved.",
                            link: `/dashboard/wallet/sphp-orders`,
                            from: "Stylus Admin"
                        }
                    })
                }

                const updateOrder = await db.user_token_order.update({
                    where: { id: order.id }, data: {
                        closed: !order.closed,
                        request_chat: false
                    }
                })

            }


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