import { publicProcedure } from "@/trpc/trpc";
import db from "@/db/db";
import { okayRes } from "@/lib/apiResponse";
import { getSession } from "@/lib/lib";
import { z } from 'zod'
import Moralis from "moralis";
import { getMoralis } from "@/lib/moralis";

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
            if (!existingAddress) {
                await getMoralis()
                await Promise.all([
                    Moralis.Streams.addAddress({
                        id: process.env.MORALIS_STREAM_ID as string,
                        address: [opts.input]
                    }),
                    db.user.create({ data: { wallet: opts.input } })
                ])
            }

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
            if (!existingAddress) {

                await getMoralis()
                await Promise.all([
                    Moralis.Streams.addAddress({
                        id: process.env.MORALIS_STREAM_ID as string,
                        address: [opts.input]
                    }),
                    db.user.create({ data: { wallet: opts.input } })
                ])

            }

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