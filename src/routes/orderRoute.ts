import db from "@/db/db";
import { getAuth } from "@/lib/nextAuth";
import { publicProcedure } from "@/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const orderRoute = {
    getCurrentUserOrder: publicProcedure.query(async () => {

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
            method: z.string(),
            currency: z.string(),
            price: z.string(),
            transaction_id: z.string(),
        })
    })).mutation(async (opts) => {

        const session = await getAuth()
        if (!session) throw new TRPCError({
            code: 'UNAUTHORIZED'
        })

        const userWallet = session.user.wallet

        const user = await db.user.findUnique({ where: { wallet: userWallet } })
        if (!user) throw new TRPCError({
            code: 'NOT_FOUND',
            message: "User Not found"
        })

        const { data } = opts.input

        const createOrder = await db.user_order.create({
            data: {
                ...data,
                status: 'processing',
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
    })
}