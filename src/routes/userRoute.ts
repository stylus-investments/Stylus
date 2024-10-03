import db from "@/db/db";
import { getUserId, privy } from "@/lib/privy";
import { publicProcedure } from "@/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { generate } from 'voucher-code-generator'
import { getAuth } from "@/lib/nextAuth";
import { ProfileStatus } from "@prisma/client";

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
                id_image: undefined,
                created_at: createInitialInfo.created_at.toISOString(),
                updated_at: createInitialInfo.updated_at.toISOString(),
                status: createInitialInfo.status as string
            }

            return data


        }

        const data = {
            ...userInfo,
            birth_date: userInfo.birth_date.toISOString(),
            id_image: undefined,
            created_at: userInfo.created_at.toISOString(),
            updated_at: userInfo.updated_at.toISOString(),
            status: userInfo.status as string
        }

        return data

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
            }, data: {
                ...data,
                status: ProfileStatus['PENDING']
            }
        })
        if (!updateUserInfo) throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Failed to create or update user info"
        })

        return true
    }),
    getAllUsers: publicProcedure.input(
        z.object({
            page: z.string().min(1).optional().default('1'),
            first_name: z.string().optional(),
            last_name: z.string().optional(),
            email: z.string().optional(),
            status: z.string().optional(),
        })
    ).query(async ({ input }) => {

        const { page, status, first_name, last_name, email } = input, limit = 10

        try {

            const auth = await getAuth()
            if (!auth) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            // Create the filter object
            const filter: any = {
                NOT: { status: ProfileStatus.INCOMPLETE },
                AND: [
                    { status: status?.toUpperCase() },
                    { first_name: { contains: first_name?.toLocaleLowerCase() } },
                    { last_name: { contains: last_name?.toLocaleLowerCase() } },
                    { email: { contains: email?.toLocaleLowerCase() } },
                ]
            };

            const users = await db.user_info.findMany({
                where: filter,
                orderBy: { created_at: 'desc' },
                skip: (Number(page) - 1) * limit, // Skip records for pagination
                take: limit,              // Limit the number of records returned
            });

            const totalUsers = await db.user_info.count({ where: filter });

            const hasNextPage = (Number(page) * limit) < totalUsers;
            const hasPreviousPage = Number(page) > 1;
            const totalPages = Math.ceil(totalUsers / limit);

            return {
                data: users,
                pagination: {
                    total: totalUsers,
                    page,
                    hasNextPage,
                    hasPreviousPage,
                    totalPages
                }
            };

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
    updateUserStatus: publicProcedure.input(z.object({
        user_id: z.string(),
        status: z.string()
    })).mutation(async ({ input }) => {

        try {

            const auth = await getAuth()
            if (!auth) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            //update user status
            const updateUser = await db.user_info.update({
                where: { user_id: input.user_id },
                data: {
                    status: input.status as ProfileStatus
                }
            })
            if (!updateUser) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Failed to update user"
            })

            const getProfileStatusMessage = (profileStatus: string) => {
                if (profileStatus === ProfileStatus['VERIFIED']) {
                    return 'Awesome! Your profile is all set and verified! 🎉';
                }
                return 'Your profile status is invalid. Please check your information.';
            }

            const message = getProfileStatusMessage(input.status)

            await db.user_notification.create({
                data: {
                    user: {
                        connect: {
                            user_id: updateUser.user_id
                        }
                    },
                    message: message,
                    link: "/dashboard/profile",
                    from: "Stylus Investments"
                }
            })

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
    updateProfileID: publicProcedure.input(z.object({
        front_id: z.string().optional(),
        back_id: z.string().optional(),
    })).mutation(async ({ input }) => {
        try {

            const auth = await getUserId()
            if (!auth) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            await db.user_info.update({
                where: {
                    user_id: auth
                }, data: {
                    front_id: input.front_id,
                    back_id: input.back_id
                }
            })

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
    })
}