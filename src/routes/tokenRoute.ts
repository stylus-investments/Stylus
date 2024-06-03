import { getAuth } from "@/lib/nextAuth";
import { getTokenPrice } from "@/lib/prices";
import { publicProcedure } from "@/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const tokenRoute = {

    getTokenPrice: publicProcedure.input(z.string()).query(async (opts) => {

        const session = await getAuth()
        if (!session) throw new TRPCError({
            code: 'UNAUTHORIZED'
        })

        const price = getTokenPrice(opts.input)

        if (!price) throw new TRPCError({
            code: 'BAD_REQUEST'
        })

        return price
    })

}