import { ORDERSTATUS, PAYMENT_METHOD } from "@/constant/order";
import db from "@/db/db";
import { getUserId } from "@/lib/privy";
import { rateLimiter } from "@/lib/ratelimiter";
import { publicProcedure } from "@/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const INSURANCE_PRICE = 300

export const investmentPlanRoute = {
    createUserInvestmentPlan: publicProcedure.input(z.object({
        name: z.string(),
        package_id: z.string(),
        base_price: z.number(),
        total_price: z.number(),
        profit_protection: z.boolean(),
        insurance: z.boolean(),
    })).mutation(async (opts) => {

        await rateLimiter.consume(1)

        const user = await getUserId()
        if (!user) throw new TRPCError({
            code: "UNAUTHORIZED"
        })

        const { name, package_id, base_price, profit_protection, insurance, total_price } = opts.input

        //retrieve package

        const investmentPackage = await db.investment_plan_package.findUnique({ where: { id: package_id } })
        if (!investmentPackage) throw new TRPCError({
            code: "NOT_FOUND",
            message: "Package not found"
        })
        if (investmentPackage.duration === 5 && (profit_protection || insurance)) throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Something is not right"
        })

        const prices = investmentPackage.prices as number[]

        if (!prices.includes(base_price)) throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Base price does not exist in package"
        })

        let recalculateTotalPrice: number = base_price

        if (investmentPackage.duration === 10) {

            if (profit_protection && insurance) {
                recalculateTotalPrice = (base_price * 1.25) + INSURANCE_PRICE;

            } else if (profit_protection && !insurance) {

                recalculateTotalPrice = base_price * 1.25;
            } else if (insurance && !profit_protection) {

                recalculateTotalPrice = base_price + INSURANCE_PRICE;
            }

        } else if (investmentPackage.duration === 20 && insurance) {
            recalculateTotalPrice = base_price + INSURANCE_PRICE;
        }

        if (recalculateTotalPrice !== total_price) throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Prices are not matched"
        })

        //create the user investment plan
        const now = new Date()
        const nextMonth = new Date(now.setMonth(now.getMonth() + 1))
        nextMonth.setHours(0, 0, 0, 0);

        const investmentPlan = await db.user_investment_plan.create({
            data: {
                user_id: user, name, total_price: recalculateTotalPrice,
                payment_count: (investmentPackage.duration * 12),
                next_order_creation: nextMonth,
                profit_protection, insurance,
                package: {
                    connect: {
                        id: investmentPackage.id
                    }
                },
                base_price
            }
        })
        if (!investmentPlan) throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Faild to create investment plan"
        })

        //create initialOrder
        await db.user_order.create({
            data: {
                amount: "Pay First",
                user_id: user,
                status: ORDERSTATUS['unpaid'],
                receipt: '/qrpay.webp',
                method: PAYMENT_METHOD['GCASH'],
                user_investment_plan: {
                    connect: {
                        id: investmentPlan.id
                    }
                }
            }
        })

        await db.$disconnect()

        return true

    }),
    getUserInvestmentPlans: publicProcedure.query(async () => {

        try {

            await rateLimiter.consume(1)

            const user = await getUserId()
            if (!user) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            const userPlans = await db.user_investment_plan.findMany({
                where: {
                    user_id: user
                },
                orderBy: {
                    created_at: "desc"
                }
            })
            if (!userPlans) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Failed to retrieve user investment plans"
            })

            return userPlans.map(plan => ({
                ...plan,
                created_at: new Date(plan.created_at).toISOString(),
                next_order_creation: new Date(plan.next_order_creation).toISOString(),
                updated_at: new Date(plan.updated_at).toISOString()
            }))

        } catch (error: any) {
            console.log(error);
            throw new TRPCError({
                code: error.code || "INTERNAL_SERVER_ERROR",
                message: error.code || "Failed to retrieve user investments plan"
            })
        } finally {
            await db.$disconnect()
        }

    }),
    retrieveSinglePlan: publicProcedure.input(z.string()).query(async (opts) => {
        try {


            await rateLimiter.consume(1)

            const user = await getUserId()
            if (!user) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            const investmentPlan = await db.user_investment_plan.findUnique({
                where: { id: opts.input },
                include: {
                    payments: true
                }
            })
            if (!investmentPlan) throw new TRPCError({
                code: "NOT_FOUND",
                message: "Plan not found"
            })

            return {
                ...investmentPlan,
                created_at: new Date(investmentPlan.created_at).toISOString(),
                next_order_creation: new Date(investmentPlan.next_order_creation).toISOString(),
                updated_at: new Date(investmentPlan.updated_at).toISOString(),
                payments: investmentPlan.payments.map(order => ({
                    ...order,
                    closed: undefined,
                    created_at: new Date(order.created_at).toISOString(),
                    updated_at: new Date(order.updated_at).toISOString()
                }))
            }

        } catch (error) {
            console.log(error);
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Failed to retrieve user investments plan"
            })
        }
    })
}