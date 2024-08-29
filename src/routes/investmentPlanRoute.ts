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

        const investmentPlan = await db.user_investment_plan.create({
            data: {
                user_id: user, name, total_price: recalculateTotalPrice,
                payment_count: (investmentPackage.duration * 12),
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

            return await db.user_investment_plan.findMany({
                orderBy: {
                    created_at: "desc"
                }
            })

        } catch (error) {
            console.log(error);
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Failed to retrieve user investments plan"
            })
        }

    })
}