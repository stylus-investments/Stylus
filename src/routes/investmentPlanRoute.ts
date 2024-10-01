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

        const auth = await getUserId()
        if (!auth) throw new TRPCError({
            code: "UNAUTHORIZED"
        })

        const user = await db.user_info.findUnique({ where: { user_id: auth } })
        if (!user) throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found"
        })

        //need to be changed
        if (user.status !== 'VERIFIED') throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Please complete your profile and wait for verification before proceeding."
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
                user: {
                    connect: {
                        user_id: user.user_id
                    }
                },
                name, total_price: recalculateTotalPrice,
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

        const durationInYears = investmentPackage.duration;
        const totalMonths = durationInYears * 12;
        const ordersData = Array.from({ length: totalMonths }, (_, i) => {
            const orderDate = new Date();
            orderDate.setMonth(orderDate.getMonth() + i);
            orderDate.setHours(0, 0, 0, 0);

            let status;
            if (i === 0) {
                status = ORDERSTATUS['unpaid']; // First order
            } else if (i === 1) {
                status = ORDERSTATUS['upcoming']; // Second order
            } else {
                status = ORDERSTATUS['inactive']; // All other orders
            }

            return {
                amount: status, // Adjust as needed
                user_id: user.user_id,
                status,
                receipt: '/qrpay.webp',
                method: PAYMENT_METHOD['GCASH'],
                user_investment_plan_id: investmentPlan.id,
                created_at: orderDate
            };
        });
        // Use createMany for batch insertion
        await db.user_order.createMany({
            data: ordersData,
        });

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
    retrieveSinglePlan: publicProcedure.input(z.object({
        plan_id: z.string(),
        page: z.string().min(1).optional().default('1'),
        status: z.string().optional(),
    })).query(async ({ input }) => {
        try {

            await rateLimiter.consume(1)

            const user = await getUserId()
            if (!user) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            // Pagination setup
            const limit = 10; // Number of items per page
            const page = Number(input.page)
            const skip = (page - 1) * limit;

            const investmentPlan = await db.user_investment_plan.findUnique({
                where: { id: input.plan_id },
                include: {
                    payments: {
                        where: {
                            status: input.status
                        },
                        skip,
                        take: limit,
                        orderBy: {
                            updated_at: 'desc'
                        }
                    }
                }
            })
            if (!investmentPlan) throw new TRPCError({
                code: "NOT_FOUND",
                message: "Plan not found"
            })

            // Retrieve the total count of payments for pagination metadata
            const totalPayments = await db.user_order.count({
                where: { user_investment_plan_id: investmentPlan.id, status: input.status },
            });

            const hasNextPage = skip + limit < totalPayments;
            const hasPreviousPage = page > 1;
            const totalPages = Math.ceil(totalPayments / limit);

            return {
                data: {
                    ...investmentPlan,
                    created_at: new Date(investmentPlan.created_at).toISOString(),
                    next_order_creation: new Date(investmentPlan.next_order_creation).toISOString(),
                    updated_at: new Date(investmentPlan.updated_at).toISOString()
                },
                pagination: {
                    total: totalPayments,
                    hasNextPage,
                    hasPreviousPage,
                    totalPages,
                    page: input.page
                }
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