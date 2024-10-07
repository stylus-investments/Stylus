import db from "@/db/db";
import { getMoralis } from "@/lib/moralis";
import { getIndexPrice, getUserTokenData } from "@/lib/prices";
import { getUserId, privy } from "@/lib/privy";
import { rateLimiter } from "@/lib/ratelimiter";
import { BASE_CHAIN_ID, USDC_ADDRESS } from "@/lib/token_address";
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
        const { tokenAddress } = opts.input

        const session = await getUserId()
        if (!session) throw new TRPCError({
            code: "UNAUTHORIZED"
        })

        const currencyExchangeRate = await db.currency_conversion.findMany()

        const user = await privy.getUser(session)

        if (!user) throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found"
        })

        const price = await getUserTokenData({
            tokenAddress,
            walletAddress: user.wallet?.address as string,
            chain: BASE_CHAIN_ID,
            currencyExchangeRate
        })

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

            const [bitcoin, usdc, conversionRate] = await Promise.all([
                axios.get(url, {
                    headers: {
                        'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
                    }
                }),
                Moralis.EvmApi.token.getTokenPrice({
                    chain: BASE_CHAIN_ID,
                    address: USDC_ADDRESS
                }),
                db.currency_conversion.findFirst({ where: { currency: "PHP" } })
            ])
            if (!conversionRate) throw new TRPCError({
                code: "NOT_FOUND"
            })

            const indexPrice = getIndexPrice({ btc_price: bitcoin.data.bitcoin.usd, usdc_price: usdc.raw.usdPrice, php_converstion: conversionRate.conversion_rate })

            return indexPrice

        } catch (error: any) {
            console.log(error);
            throw new TRPCError({
                code: error.code || "BAD_REQUEST",
                message: error.message || "Something went wrong"
            })
        }
    })

}