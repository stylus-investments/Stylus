import db from "@/db/db";
import { getAuth } from "@/lib/nextAuth";
import { publicProcedure } from "@/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const profileRoute = {
    get: publicProcedure.query(async () => {

        const session = await getAuth()
        if (!session) throw new TRPCError({
            code: 'UNAUTHORIZED'
        })

        const user = await db.user.findUnique({ where: { wallet: session.user.wallet } })
        if (!user) throw new TRPCError({
            code: 'NOT_FOUND'
        })

        return user
    }),
    update: publicProcedure
        .input(z.object({
            email: z.string(),
            phishing_code: z.string()
        })).mutation(async (opts) => {

            const newData = opts.input

            const session = await getAuth()
            if (!session) throw new TRPCError({
                code: 'UNAUTHORIZED'
            })

            const updateUser = await db.user.update({
                where: { wallet: session.user.wallet }, data: newData
            })

            if (!updateUser) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Failed to update user info"
            })

            return true

        })
}