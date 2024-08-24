import db from "@/db/db";
import { getUserId } from "@/lib/privy";
import { publicProcedure } from "@/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const userRoute = {
    getCurrentUserInfo: publicProcedure.query(async () => {

        const user = await getUserId()
        if (!user) throw new TRPCError({
            code: "UNAUTHORIZED"
        })

        //retrieve user info
        const userInfo = await db.user_info.findUnique({ where: { user_id: user } })

        if (!userInfo) throw new TRPCError({
            code: "NOT_FOUND",
            message: "User doesn't have information set"
        })

        return userInfo

    }),
    updateUserInfo: publicProcedure.input(z.object({
        first_name: z.string(),
        last_name: z.string(),
        email: z.string(),
        mobile: z.string(),
        age: z.string(),
        birth_date: z.string()
    })).mutation(async (opts) => {

        const data = opts.input

        const user = await getUserId()
        if (!user) throw new TRPCError({
            code: "UNAUTHORIZED"
        })

        //update userinfo

        const updateUserInfo = await db.user_info.upsert({
            where: {
                user_id: user
            },
            update: data,
            create: { ...data, user_id: user }
        })
        if (!updateUserInfo) throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Failed to create or update user info"
        })

        return true
    })
}