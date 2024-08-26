import { getUserTokenData } from "@/lib/prices";
import { getUserId, privy } from "@/lib/privy";
import { publicProcedure } from "@/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const tokenRoute = {

    getTokenPrice: publicProcedure.input(z.object({
        tokenAddress: z.string(),
        tokenName: z.string(),
    })).query(async (opts) => {
        const { tokenAddress, tokenName } = opts.input

        const session = await getUserId()
        if (!session) throw new TRPCError({
            code: "UNAUTHORIZED"
        })

        const user = await privy.getUser(session)

        if (!user) throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found"
        })

        const price = await getUserTokenData(tokenAddress, user.wallet?.address as string, tokenName)

        if (!price) throw new TRPCError({
            code: 'BAD_REQUEST'
        })

        return price.price
    })

}