import db from "@/db/db";
import { getUserId } from "@/lib/privy";
import { rateLimiter } from "@/lib/ratelimiter";
import { publicProcedure } from "@/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const investmentPlanRoute = {
    createUserInvestmentPlan: publicProcedure.input(z.object({
        name: z.string(),
        package_id: z.string(),
    })).mutation(async (opts) => {

        await rateLimiter.consume(1)

        const user = await getUserId()
        if (!user) throw new TRPCError({
            code: "UNAUTHORIZED"
        })

        const { name, package_id } = opts.input

        //retrieve package

        const orderPackage = await db.order_package.findUnique({ where: { id: package_id } })
        if (!orderPackage) throw new TRPCError({
            code: "NOT_FOUND",
            message: "Package not found"
        })

        //create the user investment plan

        const now = new Date()
        const nextMonth = new Date(now);
        nextMonth.setMonth(now.getMonth() + 1);

        const investmentPlan = await db.user_investment_plan.create({
            data: {
                user_id: user, name,
                payment_count: (orderPackage.duration * 12),
                next_order_creation: nextMonth,
                package: {
                    connect: {
                        id: orderPackage.id
                    }
                }
            }
        })
        if (!investmentPlan) throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Faild to create investment plan"
        })

        await db.$disconnect()

        return true

        // //create a initial order
        // const createFirstOrder = await db.user_order.create({
        //     data: {
        //         method,
        //         package: true,
        //         receipt: "/save.webp",
        //         investment_plan_id: investmentPlan.id,
        //         user_id: user,
        //         status: ORDERSTATUS['processing']
        //     }
        // })

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