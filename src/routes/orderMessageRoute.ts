import { ORDER_TYPE } from "@/constant/order";
import db from "@/db/db";
import { getAuth } from "@/lib/nextAuth";
import { getUserId } from "@/lib/privy";
import { publicProcedure } from "@/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const orderMessageRoute = {
    getOrderMessages: publicProcedure.input(z.object({
        orderID: z.string(),
        sender: z.string(),
        orderType: z.enum(Object.values(ORDER_TYPE) as [keyof typeof ORDER_TYPE])
    })).query(async (opts) => {

        const { orderID, sender, orderType } = opts.input


        if (orderType === 'sbtc') {

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

        }

        if (orderType === 'sphp') {
            const order = await db.user_token_order.findUnique({
                where: { id: orderID },
                include: {
                    order_message: {
                        select: {
                            content: true,
                            is_image: true,
                            sender: true,
                        }
                    }
                }
            })

            return order
        }

        return null

    }),
    sendOrderMessage: publicProcedure.input(z.object({
        orderID: z.string(),
        content: z.string(),
        is_image: z.boolean(),
        sender: z.string(),
        orderType: z.enum(Object.values(ORDER_TYPE) as [keyof typeof ORDER_TYPE])
    })).mutation(async (opts) => {

        const { orderID, content, is_image, sender, orderType } = opts.input

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

        if (orderType === 'sbtc') {

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

        }

        if (orderType === 'sphp') {
            const order = await db.user_token_order.findUnique({ where: { id: orderID } })
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
                        user_token_order: {
                            connect: {
                                id: orderID
                            }
                        }
                    }
                }),
                db.user_token_order.update({
                    where: {
                        id: order.id
                    },
                    data: {
                        user_unread_messages: sender === 'admin' ? order.user_unread_messages + 1 : 0,
                        admin_unread_messages: sender === 'user' ? order.admin_unread_messages + 1 : 0,
                    }
                })
            ])
        }

        return true
    }),
    updateUnreadMessage: publicProcedure.input(z.object({
        orderID: z.string().min(1, "Order ID cannot be empty"),
        sender: z.string(),
        orderType: z.enum(Object.values(ORDER_TYPE) as [keyof typeof ORDER_TYPE])
    })).mutation(async (opts) => {

        const { orderID, sender, orderType } = opts.input

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

        if (orderType === 'sbtc') {
            const order = await db.user_order.findUniqueOrThrow({
                where: {
                    id: orderID
                }
            }).catch(async e => {
                throw new TRPCError({
                    code: "NOT_FOUND",
                })
            })
            await db.user_order.update({
                where: {
                    id: orderID
                },
                data: {
                    user_unread_messages: sender === 'user' ? 0 : order.user_unread_messages,
                    admin_unread_messages: sender === 'admin' ? 0 : order.admin_unread_messages,
                }
            })
        }

        if (orderType === 'sbtc') {
            const order = await db.user_token_order.findUniqueOrThrow({
                where: {
                    id: orderID
                }
            }).catch(async e => {
                throw new TRPCError({
                    code: "NOT_FOUND",
                })
            })
            await db.user_token_order.update({
                where: {
                    id: orderID
                },
                data: {
                    user_unread_messages: sender === 'user' ? 0 : order.user_unread_messages,
                    admin_unread_messages: sender === 'admin' ? 0 : order.admin_unread_messages,
                }
            })
        }

        return true
    }),
    openMesageRequest: publicProcedure.input(z.object({
        orderID: z.string().min(1, "Order ID cannot be empty"),
        orderType: z.enum(Object.values(ORDER_TYPE) as [keyof typeof ORDER_TYPE])
    })).mutation(async ({ input }) => {

        try {

            const user = await getUserId()
            if (!user) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            const { orderType, orderID } = input

            //update order
            if (orderType === 'sbtc') {
                const requestOpenChat = await db.user_order.update({
                    where: { id: orderID, user_id: user }, data: {
                        request_chat: true
                    }
                })
                if (!requestOpenChat) throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Something went wrong when requesting to update the order"
                })
            }

            if (orderType === 'sphp') {
                const requestOpenChat = await db.user_token_order.update({
                    where: { id: orderID, user_id: user }, data: {
                        request_chat: true
                    }
                })
                if (!requestOpenChat) throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Something went wrong when requesting to update the order"
                })
            }

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