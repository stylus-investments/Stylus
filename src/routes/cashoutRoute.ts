import { ABI } from "@/constant/abi";
import db from "@/db/db";
import { okayRes } from "@/lib/apiResponse";
import { getAuth } from "@/lib/nextAuth";
import { getUserId } from "@/lib/privy";
import { rateLimiter } from "@/lib/ratelimiter";
import { SAVE } from "@/lib/token_address";
import { publicProcedure } from "@/trpc/trpc";
import { cashoutFormSchema, compoundFormSchema } from "@/types/cashoutType";
import { cashout_status } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { ethers } from "ethers";
import { z } from "zod";

export const cashoutRoute = {
    cashoutToken: publicProcedure.input(z.object({
        data: cashoutFormSchema,
        hash: z.string().min(1, {
            message: "Transaction hash is required"
        })
    })).mutation(async ({ input }) => {

        try {

            const auth = await getUserId()
            if (!auth) throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "Login First."
            })

            const { account_name, amount, account_number, payment_method, token_name } = input.data

            //create cashout request
            const cCashoutRequest = await db.user_cashout.create({
                data: {
                    account_name,
                    amount: (Number(amount) * 0.95).toString(),
                    account_number,
                    transaction_hash: input.hash,
                    token_name,
                    payment_method,
                    status: cashout_status['PENDING'], user_info: {
                        connect: {
                            user_id: auth
                        }
                    }
                }
            })
            if (!cCashoutRequest) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Failed to create cashout request"
            })


            return okayRes()

        } catch (error: any) {
            console.error(error)
            throw new TRPCError({
                code: error.code || "INTERNAL_SERVER_ERROR",
                message: error.message || "Something went wrong"
            })
        }
    }),
    qCashoutHistory: publicProcedure.query(async () => {
        try {

            const auth = await getUserId()
            if (!auth) throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "Login First."
            })

            return await db.user_cashout.findMany({
                where: { user_id: auth }
            })

        } catch (error: any) {
            console.error(error)
            throw new TRPCError({
                code: error.code || "INTERNAL_SERVER_ERROR",
                message: error.message || "Something went wrong"
            })
        }
    }),
    qCashoutList: publicProcedure.input(z.object({
        page: z.string().min(1).optional().default('1'),
        status: z.nativeEnum(cashout_status).optional(),
    })).query(async ({ input }) => {
        try {

            const { page, status } = input,
                limit = 10

            const auth = await getAuth()
            if (!auth) throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "Login First."
            })

            const qCashout = await db.user_cashout.findMany({
                where: {
                    status,
                },
                orderBy: { updated_at: 'desc' },
                skip: (Number(page) - 1) * limit, // Skip records for pagination
                take: limit
            })
            const tCashout = await db.user_cashout.count({
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
    uCashoutStatus: publicProcedure.input(z.object({
        cashout_id: z.string(),
    })).mutation(async ({ input }) => {
        try {

            const auth = await getAuth()
            if (!auth) throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "Login First."
            })

            const { cashout_id } = input;

            const uCashout = await db.user_cashout.update({
                where: {
                    id: cashout_id
                },
                data: {
                    status: cashout_status.COMPLETED
                }
            })
            if (!uCashout) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Failed to update cashout request"
            })

            return okayRes()

        } catch (error: any) {
            console.error(error)
            throw new TRPCError({
                code: error.code || "INTERNAL_SERVER_ERROR",
                message: error.message || "Something went wrong"
            })
        }
    }),
    cashoutCompound: publicProcedure.input(z.object({
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