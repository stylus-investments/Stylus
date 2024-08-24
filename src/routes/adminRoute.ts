import db from "@/db/db";
import { getAuth } from "@/lib/nextAuth";
import { publicProcedure } from "@/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import bcrypt from 'bcrypt'
export const adminRoute = {
    registerAdmin: publicProcedure.input(z.object({
        username: z.string(),
        password: z.string(),
        name: z.string(),
        root_admin: z.boolean()
    })).mutation(async (opts) => {

        const { username, password, name, root_admin } = opts.input

        const auth = await getAuth()
        if (!auth) throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Fck you"
        })

        const hashedPassword = await bcrypt.hash(password, 10)

        const createAdmin = await db.admin.create({
            data: { username, password: hashedPassword, name, root_admin }
        })
        if (!createAdmin) throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Failed to create admin"
        })

        return true

    })
}