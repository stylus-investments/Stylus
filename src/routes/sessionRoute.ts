import { publicProcedure } from "@/app/server/trpc";
import db from "@/db/db";
import { okayRes } from "@/lib/apiResponse";
import { getSession } from "@/lib/lib";
import { z } from 'zod'

export const sessionRoute = {

    get: publicProcedure.query(async () => {

        const session = await getSession()

        return session.address
    }),
    post: publicProcedure.input(z.string()).mutation(async (opts) => {
        try {
            //get the session
            const session = await getSession()
            //update the session
            session.address = opts.input

            const existingAddress = await db.user.findUnique({
                where: { wallet: opts.input }
            })

            //if this wallet doesn't exist in our database then create one
            if (!existingAddress) await db.user.create({ data: { wallet: opts.input } })

            //save the session
            await session.save()

            //return true
            return okayRes()

        } catch (error) {
            console.log(error);
            throw error
        }
    }),
    update: publicProcedure.input(z.string()).mutation(async (opts) => {
        try {
            //get the session
            const session = await getSession()

            if (!session.address) throw Error

            //check if user existed in database
            const existingAddress = await db.user.findUnique({
                where: { wallet: opts.input }
            })

            //if this wallet doesn't exist in our database then create one
            if (!existingAddress) await db.user.create({ data: { wallet: opts.input } })

            //update the session
            session.address = opts.input

            //save the session
            await session.save()

            //return true
            return okayRes()

        } catch (error) {
            console.log(error);
            throw error
        }
    }),
    delete: publicProcedure.mutation(async () => {
        try {

            //delete the session
            const session = await getSession()

            session.destroy()
            await session.save()

            return okayRes()

        } catch (error) {
            console.log(error);
            throw error
        }
    })
}