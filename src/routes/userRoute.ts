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
            const createInitialInfo = await db.user_info.create({
                data: {
                    first_name: "",
                    last_name: "",
                    id_image: [''],
                    email: "",
                    mobile: "",
                    age: "",
                    birth_date: new Date(),
                    user_id: user,
                    wallet: getUser.wallet?.address || "",
                    referral_info: {
                        create: {
                            referral_code: userReferralCode[0],
                            payment_account_name: "",
                            payment_account_number: "",
                            inviter_referral_code: referal || ""
                        }
                    }
                }
            })

            const createInitialReferralRewards = await db.referral_reward.create({
                data: {
                    reward: 0,
                    user: {
                        connect: {
                            user_id: createInitialInfo.user_id
                        }
                    },
                    inviter_referral_info: {
                        connect: {
                            user_id: inviter?.user_id
                        }
                    }
                }
            })

            if (!createInitialInfo || !createInitialReferralRewards) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Faild to create initial user info"
            })
            if (referalCode) cookies().delete("inviter")

            const data = {
                ...createInitialInfo,
                birth_date: createInitialInfo.birth_date.toISOString(),
                id_image: createInitialInfo.id_image as string[]
            }

            return data


        }

        const data = {
            ...userInfo,
            birth_date: userInfo.birth_date.toISOString(),
            id_image: userInfo.id_image as string[]
        }

        return data

    }),
    updateUserInfo: publicProcedure.input(z.object({
        first_name: z.string(),
        last_name: z.string(),
        email: z.string(),
        mobile: z.string(),
        age: z.string(),
        id_image: z.string().array(),
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