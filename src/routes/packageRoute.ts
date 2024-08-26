import db from "@/db/db";
import { getAuth } from "@/lib/nextAuth";
import { rateLimiter } from "@/lib/ratelimiter";
import { publicProcedure } from "@/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const packageRoute = {
    getAllPackages: publicProcedure.query(async () => {

        await rateLimiter.consume(1)

        const packages = await db.order_package.findMany()

        await db.$disconnect()

        return packages

    }),
    createPackage: publicProcedure.input(z.object({
        name: z.string(),
        perks: z.string(),
        duration: z.number(),
        monthly_payment: z.number(),
        currency: z.string()
    })).mutation(async (opts) => {

        try {

            await rateLimiter.consume(1)

            const session = await getAuth()
            if (!session) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            //create the package
            const createPackage = await db.order_package.create({
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
        perks: z.string(),
        duration: z.number(),
        monthly_payment: z.number(),
        currency: z.string(),
        package_id: z.string()
    })).mutation(async (opts) => {


        try {

            await rateLimiter.consume(1)

            const session = await getAuth()
            if (!session) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            //create the package
            const updatePackage = await db.order_package.update({
                where: {
                    id: opts.input.package_id
                },
                data: opts.input
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