import { ORDERSTATUS } from "@/constant/order";
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
    getAllSphpOrder: publicProcedure.input(z.object({
        page: z.string().min(1),
        status: z.string().optional(),
        request_chat: z.string().optional(),
    })).query(async ({ input }) => {

        const { page, status, request_chat } = input, limit = 8

        await rateLimiter.consume(1)

        const auth = await getUserId()
        if (!auth) throw new TRPCError({
            code: "UNAUTHORIZED"
        })


        const user = await db.user_info.findUniqueOrThrow({ where: { user_id: auth } }).catch(e => {
            throw new TRPCError({
                code: "NOT_FOUND"
            })
        })
        const [qUserSPHPOrder, totalSPHPOrder] = await Promise.all([
            db.user_token_order.findMany({
                where: {
                    request_chat: request_chat ? true : undefined,
                    status
                },
                orderBy: {
                    updated_at: 'desc'
                },
                skip: (Number(page) - 1) * limit, // Skip records for pagination
                take: limit
            }),
            db.user_token_order.count({
                where: {
                    status,
                    user_id: user.user_id
                }
            })
        ])

        const hasNextPage = (Number(page) * limit) < totalSPHPOrder;
        const hasPreviousPage = Number(page) > 1;
        const totalPages = Math.ceil(totalSPHPOrder / limit);

        return {
            data: qUserSPHPOrder,
            pagination: {
                total: totalSPHPOrder,
                page,
                hasNextPage,
                hasPreviousPage,
                totalPages
            }
        };
    }),
    buySPHPToken: publicProcedure.input(z.object({
        amount: z.string(),
        method: z.string(),
        receipt: z.string(),

    })).mutation(async ({ input }) => {
        await rateLimiter.consume(1)

        const auth = await getUserId()
        if (!auth) throw new TRPCError({
            code: "UNAUTHORIZED"
        })

        const { amount, method, receipt } = input

        const user = await db.user_info.findUniqueOrThrow({ where: { user_id: auth } }).catch(e => {
            throw new TRPCError({
                code: "NOT_FOUND"
            })
        })

        const cUserTokenOrder = await db.user_token_order.create({
            data: {
                user: {
                    connect: {
                        user_id: user?.user_id
                    }
                },
                amount,
                method,
                receipt,
                status: ORDERSTATUS.processing
            }
        })
        if (!cUserTokenOrder) throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Failed to buy SPHP"
        })

        return true
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
    }),
    getUserTokenHistory: publicProcedure.input(z.string()).query(async ({ input }) => {

        try {
            const tokenAddress = input

            const auth = await getUserId()
            if (!auth) throw new TRPCError({
                code: "UNAUTHORIZED"
            })



            await rateLimiter.consume(1)
            await getMoralis()

        } catch (error: any) {
            console.log(error);
            throw new TRPCError({
                code: error.code || "BAD_REQUEST",
                message: error.message || "Something went wrong"
            })
        }

    })

}