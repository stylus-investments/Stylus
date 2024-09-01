import db from "@/db/db";
import { getUserId, privy } from "@/lib/privy";
import { publicProcedure } from "@/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { generate } from 'voucher-code-generator'

export const userRoute = {
    getCurrentUserInfo: publicProcedure.query(async () => {

        const user = await getUserId()
        if (!user) throw new TRPCError({
            code: "UNAUTHORIZED"
        })

        //retrieve user info
        const userInfo = await db.user_info.findUnique({
            where: { user_id: user }
        })

        if (!userInfo) {

            const referalCode = cookies().get("inviter")?.value || process.env.VEGETA

            const userReferralCode = generate({
                length: 8,
                count: 1
            })

            const [getUser, inviter] = await Promise.all([
                privy.getUser(user),
                db.referral_info.findUnique({ where: { referral_code: referalCode || "" } })
            ])
            const referal = inviter ? inviter.referral_code : process.env.VEGETA

            //create a initial user info
            const [createInitialInfo, createInitialReferralInfo] = await Promise.all([
                db.user_info.create({
                    data: {
                        first_name: "",
                        last_name: "",
                        email: "",
                        inviter_referral_code: referal || "",
                        mobile: "",
                        age: "",
                        birth_date: new Date(),
                        user_id: user,
                        wallet: getUser.wallet?.address || ""
                    }
                }),
                db.referral_info.create({
                    data: {
                        user_id: user,
                        payment_account_name: '',
                        payment_account_number: '',
                        referral_code: userReferralCode[0]
                    }
                })
            ])
            if (!createInitialInfo || !createInitialReferralInfo) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Faild to create initial user info"
            })
            if (referalCode) cookies().delete("inviter")

            return createInitialInfo
        }

        const referralInfo = await db.referral_info.findUnique({ where: { user_id: userInfo.user_id } })
        if (!referralInfo) throw new TRPCError({
            code: "NOT_FOUND"
        })

        return userInfo

    }),
    updateUserInfo: publicProcedure.input(z.object({
        first_name: z.string(),
        last_name: z.string(),
        email: z.string(),
        mobile: z.string(),
        age: z.string(),
        birth_date: z.string(),
    })).mutation(async (opts) => {

        const data = opts.input

        const user = await getUserId()
        if (!user) throw new TRPCError({
            code: "UNAUTHORIZED"
        })

        const getUser = await db.user_info.findUnique({ where: { user_id: user } })
        if (!getUser) throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found"
        })

        //update userinfo
        const updateUserInfo = await db.user_info.update({
            where: {
                user_id: user
            }, data
        })
        if (!updateUserInfo) throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Failed to create or update user info"
        })

        return true
    })
}