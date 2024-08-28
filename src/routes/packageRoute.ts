import db from "@/db/db";
import { getAuth } from "@/lib/nextAuth";
import { getUserId } from "@/lib/privy";
import { rateLimiter } from "@/lib/ratelimiter";
import { publicProcedure } from "@/trpc/trpc";
import { BillingCycle } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const packageRoute = {
    getSinglePackage: publicProcedure.input(z.string()).query(async (opts) => {

        const auth = await getAuth()
        if (!auth) throw new TRPCError({
            code: 'UNAUTHORIZED'
        })

        const packageID = opts.input

        const packagePlan = await db.investment_plan_package.findUnique({
            where: {
                id: packageID
            }
        })
        if (!packagePlan) throw new TRPCError({
            code: "NOT_FOUND",
            message: "Package not found"
        })

        const modifyPackage = {
            ...packagePlan,
            perks: packagePlan.perks as string[],
            prices: packagePlan.prices as number[],
            billing_cycle: packagePlan.billing_cycle as "DAILY" | "WEEKLY" | "MONTHLY"
        }

        return modifyPackage

    }),
    getAllPackages: publicProcedure.input(z.enum(["ADMIN", "USER"])).query(async (opts) => {


        const user = opts.input

        if (user === 'ADMIN') {
            const auth = await getAuth()
            if (!auth) throw new TRPCError({
                code: "UNAUTHORIZED"
            })
        } else {
            const user = await getUserId()
            if (!user) throw new TRPCError({
                code: "UNAUTHORIZED"
            })
        }

        await rateLimiter.consume(1)

        const packages = await db.investment_plan_package.findMany()

        await db.$disconnect()

        const modifyPackage = packages.map(obj => ({
            ...obj,
            perks: obj.perks as string[],
            prices: obj.prices as number[]
        }))

        return modifyPackage

    }),
    createPackage: publicProcedure.input(z.object({
        name: z.string(),
        perks: z.array(z.string()),
        prices: z.array(z.number()),
        duration: z.number(),
        billing_cycle: z.enum([BillingCycle.DAILY, BillingCycle.WEEKLY, BillingCycle.MONTHLY]),
    })).mutation(async (opts) => {

        try {

            await rateLimiter.consume(1)

            const session = await getAuth()
            if (!session) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            //create the package
            const createPackage = await db.investment_plan_package.create({
                data: opts.input
            })
            if (!createPackage) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Failed to create package"
            })

            return true

        } catch (error: any) {
            console.log(error);
            throw new TRPCError({
                code: error.code || "BAD_REQUEST",
                message: error.message || "Something went wrong"
            })
        } finally {
            await db.$disconnect()
        }

    }),
    updatePackage: publicProcedure.input(z.object({
        name: z.string(),
        perks: z.array(z.string()),
        prices: z.array(z.number()),
        package_id: z.string(),
        billing_cycle: z.enum([BillingCycle.DAILY, BillingCycle.WEEKLY, BillingCycle.MONTHLY]),
    })).mutation(async (opts) => {

        try {

            await rateLimiter.consume(1)

            const session = await getAuth()
            if (!session) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            const data = { ...opts.input, package_id: undefined }

            //create the package
            const updatePackage = await db.investment_plan_package.update({
                where: {
                    id: opts.input.package_id
                },
                data
            })
            if (!updatePackage) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Failed to update package"
            })

            return true

        } catch (error: any) {
            console.log(error);
            throw new TRPCError({
                code: error.code || "BAD_REQUEST",
                message: error.message || "Something went wrong"
            })
        } finally {
            await db.$disconnect()
        }
    })
}