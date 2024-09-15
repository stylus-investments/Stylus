import { ORDERSTATUS } from "@/constant/order";
import db from "@/db/db";
import { getAuth } from "@/lib/nextAuth";
import { getUserId } from "@/lib/privy";
import { rateLimiter } from "@/lib/ratelimiter";
import { publicProcedure } from "@/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const referralsRoute = {
    getReferals: publicProcedure.query(async () => {

        try {

            const auth = await getUserId()
            if (!auth) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            const user = await db.referral_info.findUnique({ where: { user_id: auth } })
            if (!user) throw new TRPCError({
                code: "NOT_FOUND",
                message: "User not found"
            })

            //retrieve all invited users
            const invitedUsers = await db.user_info.findMany({
                where: {
                    inviter_referral_code: user.referral_code,
                    first_name: {
                        not: ''
                    }
                }, select: {
                    first_name: true,
                    last_name: true,
                    created_at: true,
                    inviter_reward: {
                        select: {
                            reward: true,
                        }
                    },
                    investment_plans: {
                        select: {
                            id: true,
                            payments: {
                                select: {
                                    status: true
                                }
                            }
                        }
                    }

                }
            })

            return invitedUsers.map(user => {
                const totalPlans = user.investment_plans.length;
                const unpaidPlans = user.investment_plans.reduce((total, plan) => {
                    const totalUnpaidOrder = plan.payments.reduce((total, order) => {
                        if (order.status !== ORDERSTATUS['completed']) {
                            return total + 1;
                        }
                        return total;
                    }, 0);

                    return total + totalUnpaidOrder;
                }, 0);

                const reward = user.inviter_reward.length > 0 ? user.inviter_reward[0].reward : 0

                return {
                    ...user,
                    investment_plans: undefined,
                    totalPlans,
                    unpaidPlans,
                    inviter_reward: undefined,
                    reward,
                };
            });

        } catch (error: any) {
            console.log(error);
        } finally {
            await db.$disconnect()
        }
    }),
    getUserReferralInfo: publicProcedure.query(async () => {
        try {

            const auth = await getUserId()
            if (!auth) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            const userReferralInfo = await db.referral_info.findUnique({ where: { user_id: auth } })
            if (!userReferralInfo) throw new TRPCError({
                code: "NOT_FOUND",
                message: "Referral info not found"
            })

            return userReferralInfo

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
    updateReferralPaymentInfo: publicProcedure.input(z.object({
        account_number: z.string(),
        account_name: z.string()
    })).mutation(async (opts) => {
        try {

            await rateLimiter.consume(1)

            const auth = await getUserId()
            if (!auth) throw new TRPCError({ code: "UNAUTHORIZED" })

            const { account_name, account_number } = opts.input

            const updateReferralPayment = await db.referral_info.update({
                where: { user_id: auth }, data: {
                    payment_account_name: account_name,
                    payment_account_number: account_number
                }
            })
            if (!updateReferralPayment) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Failed to update payment info"
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
    withdrawReferralRewards: publicProcedure.mutation(async () => {

        try {

            await rateLimiter.consume(1)

            const auth = await getUserId()
            if (!auth) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            const referralInfo = await db.referral_info.findUnique({
                where: {
                    user_id: auth
                }
            })
            if (!referralInfo) throw new TRPCError({
                code: "NOT_FOUND",
                message: "Referral user not found"
            })
            if (!referralInfo.unclaimed_reward) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Minimum Payout is 1 STXPHP"
            })
            if (!referralInfo.payment_account_name || !referralInfo.payment_account_number) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Update your payment info first."
            })

            //update unclaimed_reward amount
            const updateUnclaimReward = await db.referral_info.update({
                where: {
                    user_id: referralInfo.user_id
                },
                data: {
                    unclaimed_reward: 0
                }
            })
            if (!updateUnclaimReward) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Failed to update unclaimed reward"
            })

            const [usersInvitedByWithdrawer, createPayout] = await Promise.all([
                db.referral_reward.updateMany({
                    where: {
                        reward: {
                            not: 0
                        },
                        inviter_referral_info_id: auth
                    }, data: {
                        reward: 0
                    }
                }),
                db.referral_payout.create({
                    data: {
                        amount: referralInfo.unclaimed_reward,
                        status: ORDERSTATUS['processing'],
                        payment_account_name: referralInfo.payment_account_name,
                        payment_account_number: referralInfo.payment_account_number,
                        user: {
                            connect: {
                                user_id: referralInfo.user_id
                            }
                        }
                    }
                })
            ])
            if (!usersInvitedByWithdrawer || !createPayout) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Failed to create payout"
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
    getPayoutHistory: publicProcedure.query(async () => {
        try {

            const auth = await getUserId()
            if (!auth) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            const user = await db.user_info.findUnique({
                where: { user_id: auth },
                select: {
                    referral_payout: true
                }
            })
            if (!user) throw new TRPCError({
                code: "NOT_FOUND"
            })

            return user.referral_payout

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
    getAllPayouts: publicProcedure.query(async () => {
        try {

            const auth = await getAuth()
            if (!auth) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            const payoutRequest = await db.referral_payout.findMany()

            const modifyData = payoutRequest.map(payout => ({
                ...payout,
                updated_at: undefined,
                created_at: new Date(payout.created_at).toDateString(),
            }))

            return modifyData

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
    confirmPayout: publicProcedure.input(z.string()).mutation(async (opts) => {
        try {

            await rateLimiter.consume(1)

            const auth = await getAuth()
            if (!auth) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            const updatePayout = await db.referral_payout.update({
                where: {
                    id: opts.input
                }, data: {
                    status: ORDERSTATUS['completed']
                }
            })
            if (!updatePayout) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Failed to update payout request"
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
    distributeTokenReward: publicProcedure.query(async () => {
        try {

            await rateLimiter.consume(1)

            const now = new Date()
            if (now.getDate() !== 1) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "STXPHP Distribution only allowed in the first day of the month"
            })

        } catch (error: any) {
            console.log(error);
            throw new TRPCError({
                code: error.code || "INTERNAL_SERVER_ERROR",
                message: error.message || "Server Error"
            })
        } finally {
            await db.$disconnect()
        }
    }),
    getReferralLeaderboard: publicProcedure.query(async () => {

        try {

            // const user = await getUserId()
            // if (!user) throw new TRPCError({
            //     code: "UNAUTHORIZED",
            // })

            const top10UserIds = await db.$queryRaw`
    SELECT r.user_id
    FROM referral_info r
    LEFT JOIN referral_reward rh ON r.user_id = rh.inviter_referral_info_id
    GROUP BY r.user_id
    ORDER BY COUNT(rh.inviter_referral_info_id) DESC
    LIMIT 10
` as { user_id: string }[]

            const sortedUserIds = top10UserIds.map(result => result.user_id);
            // Step 3: Fetch detailed user information including reward history
            const [top10Users, userInfos] = await Promise.all([
                db.referral_info.findMany({
                    where: {
                        user_id: {
                            in: sortedUserIds
                        }
                    },
                    select: {
                        user_id: true,
                        total_reward: true,
                        reward_history: {
                            select: {
                                id: true
                            }
                        }
                    }
                }),
                // Fetch additional user details from user_info
                db.user_info.findMany({
                    where: {
                        user_id: {
                            in: sortedUserIds
                        }
                    }, select: {
                        first_name: true,
                        last_name: true,
                        user_id: true
                    }
                })
            ])

            const userInfoMap = new Map(userInfos.map(user => [user.user_id, user]));

            const detailedResults = sortedUserIds.map(userId => {
                const user = top10Users.find(u => u.user_id === userId);
                const userInfo = userInfoMap.get(userId);

                return {
                    ...user,
                    name: `${userInfo?.first_name} ${userInfo?.last_name}`,
                    reward_history: undefined,
                    total_reward: user?.total_reward,
                    totalInvites: user?.reward_history.length
                };
            });

            return detailedResults

        } catch (error: any) {
            console.log(error);
            throw new TRPCError({
                code: error.code || "INTERNAL_SERVER_ERROR",
                message: error.message || "Server Error"
            })
        } finally {
            await db.$disconnect()
        }

    })
}