import { getMoralis } from "@/lib/moralis";
import { getUserTokenData } from "@/lib/prices";
import { getUserId, privy } from "@/lib/privy";
import { rateLimiter } from "@/lib/ratelimiter";
import { USDC_ADDRESS } from "@/lib/token_address";
import { publicProcedure } from "@/trpc/trpc";
import { TRPCError } from "@trpc/server";
import axios from "axios";
import Moralis from "moralis";
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
    }),
    getIndexPrice: publicProcedure.query(async () => {

        try {

            await rateLimiter.consume(1)
            await getMoralis()

            const url = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&precision=full`;

            const [bitcoin, usdc] = await Promise.all([
                axios.get(url, {
                    headers: {
                        'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
                    }
                }),
                Moralis.EvmApi.token.getTokenPrice({
                    chain: process.env.CHAIN,
                    address: USDC_ADDRESS
                })
            ])

            //BITCOIN
            const btc_shot = 50000
            const btc_market = bitcoin.data.bitcoin.usd
            const btc_delta = btc_market / btc_shot * 100
            const btc_weight = (btc_delta - 100) / 2

            //USDC
            const usdc_shot = 1
            const usdc_market = usdc.raw.usdPrice
            const usdc_delta = usdc_market / usdc_shot * 100
            const usdc_weight = (usdc_delta - 100) / 4

            //ECPC
            const ecpc_market = 1

            //weight sum
            const asset_weight = btc_weight + usdc_weight
            const decimal = asset_weight / 100;

            //index price
            const index = 1 + 1 * decimal;

            return index

        } catch (error: any) {
            console.log(error);
            throw new TRPCError({
                code: error.code || "BAD_REQUEST",
                message: error.message || "Something went wrong"
            })
        }


    })

}