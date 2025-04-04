import { NewCashInRequestEmail } from "@/components/emails/cashin-email";
import { ABI } from "@/constant/abi";
import { ORDERSTATUS } from "@/constant/order";
import db from "@/db/db";
import { okayRes } from "@/lib/apiResponse";
import { getMoralis } from "@/lib/moralis";
import { getAuth } from "@/lib/nextAuth";
import { getIndexPrice } from "@/lib/prices";
import { getUserId } from "@/lib/privy";
import { rateLimiter } from "@/lib/ratelimiter";
import { resend } from "@/lib/resend";
import { BASE_CHAIN_ID, SAVE, SPHP, USDC_ADDRESS } from "@/lib/token_address";
import { publicProcedure } from "@/trpc/trpc";
import { compoundFormSchema } from "@/types/cashoutType";
import { TRPCError } from "@trpc/server";
import axios from "axios";
import { ethers } from "ethers";
import Moralis from "moralis";
import { z } from "zod";

export const tokenRoute = {
    qAllSPHPOrder: publicProcedure.input(z.object({
        page: z.string().min(1).optional().default('1'),
        status: z.string().optional(),
    })).query(async ({ input }) => {
        try {

            const { page, status } = input,
                limit = 10

            const auth = await getAuth()
            if (!auth) throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "Login First."
            })

            const qCashout = await db.user_token_order.findMany({
                where: {
                    status,
                },
                orderBy: { updated_at: 'desc' },
                skip: (Number(page) - 1) * limit, // Skip records for pagination
                take: limit
            })
            const tCashout = await db.user_token_order.count({
                where: {
                    status
                }
            });

            const hasNextPage = (Number(page) * limit) < tCashout;
            const hasPreviousPage = Number(page) > 1;
            const totalPages = Math.ceil(tCashout / limit);

            return {
                data: qCashout,
                pagination: {
                    total: tCashout,
                    page,
                    hasNextPage,
                    hasPreviousPage,
                    totalPages
                }
            };

        } catch (error: any) {
            console.error(error)
            throw new TRPCError({
                code: error.code || "INTERNAL_SERVER_ERROR",
                message: error.message || "Something went wrong"
            })
        }
    }),
    getUserAllSphpOrder: publicProcedure.input(z.object({
        page: z.string().min(1).default("1"),
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
                    status,
                    user_id: user.user_id
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

        await resend.emails.send({
            from: 'New Cashin Request <order@stylus.investments>',
            to: ['support@stylus.investments'],
            subject: 'New Cashin Request',
            react: NewCashInRequestEmail(),
        });


        return true
    }),
    updateSPHPTokenOrder: publicProcedure.input(z.object({
        token_order_id: z.string(),
    })).mutation(async ({ input }) => {
        const auth = await getAuth()
        if (!auth) throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Login First."
        })

        const { token_order_id } = input;

        const uCashout = await db.user_token_order.update({
            where: {
                id: token_order_id
            },
            data: {
                status: ORDERSTATUS.paid
            }
        })
        if (!uCashout) throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Failed to update cashout request"
        })

        return okayRes()
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

    }),
    convertUsdcToSphp: publicProcedure.input(z.object({
        data: compoundFormSchema,
        hash: z.string().min(1, {
            message: "Transaction hash is required"
        })
    })).mutation(async ({ input }) => {
        const provider = new ethers.JsonRpcProvider(process.env.MORALIS_RPC_URL); // Your RPC URL
        const wallet = new ethers.Wallet(process.env.ASSET_WALLET_PRIVATE_KEY as string, provider); // Wallet used to send gas fees


        await rateLimiter.consume(1)

        // const txReceipt = await provider.getTransactionReceipt(input.hash);


        // console.log("Transaction Reciept:", txReceipt)

        const auth = await getUserId()
        if (!auth) throw new TRPCError({
            code: "UNAUTHORIZED"
        })

        const [user, exchangeRate] = await Promise.all([
            db.user_info.findUnique({ where: { user_id: auth } }),
            db.currency_conversion.findUnique({
                where: {
                    currency: "PHP"
                }
            })
        ])
        if (!user) throw new TRPCError({
            code: 'NOT_FOUND',
            message: "User not found"
        })
        if (!exchangeRate) throw new TRPCError({
            code: "NOT_FOUND",
            message: "Currency not found"
        })

        // console.log("User found", user)

        // Create contract instance
        const tokenAddress = SPHP
        const tokenContract = new ethers.Contract(tokenAddress, ABI, wallet);

        const decimals = await tokenContract.decimals();

        // console.log("Getting token decimal", decimals)

        const tokenAmount = (Number(input.data.amount) * Number(exchangeRate.conversion_rate)).toFixed(6)

        const tokenAmountToSend = ethers.parseUnits(tokenAmount, decimals)

        // console.log("Token amount conversion", tokenAmount)
        // console.log("Token amount to Send", tokenAmountToSend)

        const tx = await tokenContract.transfer(user.wallet, Number(tokenAmountToSend));

        // console.log("Transaction request", tx)

        // Step 4: Wait for the transaction to be mined
        await tx.wait();

        // console.log("Transaction complete")

        return true
    }),
    convertSphpToSave: publicProcedure.input(z.object({
        data: compoundFormSchema,
        hash: z.string().min(1, {
            message: "Transaction hash is required"
        })
    })).mutation(async ({ input }) => {
        const provider = new ethers.JsonRpcProvider(process.env.MORALIS_RPC_URL); // Your RPC URL
        const wallet = new ethers.Wallet(process.env.ASSET_WALLET_PRIVATE_KEY as string, provider); // Wallet used to send gas fees

        await rateLimiter.consume(1)

        const auth = await getUserId()
        if (!auth) throw new TRPCError({
            code: "UNAUTHORIZED"
        })

        const [user, exchangeRate] = await Promise.all([
            db.user_info.findUnique({ where: { user_id: auth } }),
            db.currency_conversion.findUnique({
                where: {
                    currency: "PHP"
                }
            })
        ])
        if (!user) throw new TRPCError({
            code: 'NOT_FOUND',
            message: "User not found"
        })
        if (!exchangeRate) throw new TRPCError({
            code: "NOT_FOUND",
            message: "Currency not found"
        })

        console.log("User found", user)

        // Create contract instance
        const tokenAddress = SAVE
        const tokenContract = new ethers.Contract(tokenAddress, ABI, wallet);

        const decimals = await tokenContract.decimals();

        console.log("Getting token decimal", decimals)

        const tokenAmount = (Number(input.data.amount) / Number(exchangeRate.conversion_rate)).toFixed(6)

        const tokenAmountToSend = ethers.parseUnits(tokenAmount, decimals)

        console.log("Token amount conversion", tokenAmount)
        console.log("Token amount to Send", tokenAmountToSend)

        const tx = await tokenContract.transfer(user.wallet, Number(tokenAmountToSend));

        console.log("Transaction request", tx)

        // Step 4: Wait for the transaction to be mined
        await tx.wait();

        console.log("Transaction complete")

        return true
    })
}