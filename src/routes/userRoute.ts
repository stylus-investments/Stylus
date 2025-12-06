import db from "@/db/db";
import { getUserId, privy } from "@/lib/privy";
import { publicProcedure } from "@/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { generate } from 'voucher-code-generator'
import { getAuth } from "@/lib/nextAuth";
import { ProfileStatus } from "@prisma/client";
import { rateLimiter } from "@/lib/ratelimiter";
import { UTApi } from "uploadthing/server";
import { ethers } from "ethers";
import axios from "axios";
import { okayRes } from "@/lib/apiResponse";
import { compoundFormSchema } from "@/types/cashoutType";

export const userRoute = {
    getCurrentUserInfo: publicProcedure.query(async () => {

        const user = await getUserId()
        if (!user) throw new TRPCError({
            code: "UNAUTHORIZED"
        })

        const userInfo = await db.user_info.findUnique({
            where: { user_id: user }
        })

        console.log(userInfo)

        if (!userInfo) {

            const referalCode = cookies().get("inviter")?.value || process.env.VEGETA

            const userReferralCode = generate({
                length: 8,
                count: 1
            })

            const [getUser, inviter] = await Promise.all([
                privy.getUserById(user),
                db.referral_info.findUnique({ where: { referral_code: referalCode || "" } })
            ])

            const referal = inviter ? inviter.referral_code : process.env.VEGETA

            //create a initial user info
            const createInitialInfo = await db.user_info.create({
                data: {
                    first_name: "",
                    last_name: "",
                    id_image: [''],
                    email: getUser?.email?.address || "",
                    claimed_gass: true,
                    mobile: "",
                    age: "",
                    birth_date: new Date(),
                    user_id: user,
                    wallet: getUser.wallet?.address || "",
                    referral_info: {
                        create: {
                            referral_code: userReferralCode[0],
                            payment_account_name: "",
                            payment_account_number: "",
                            inviter_referral_code: referal || ""
                        }
                    }
                }
            })

            const createInitialReferralRewards = await db.referral_reward.create({
                data: {
                    reward: 0,
                    user: {
                        connect: {
                            user_id: createInitialInfo.user_id
                        }
                    },
                    inviter_referral_info: {
                        connect: {
                            user_id: inviter?.user_id
                        }
                    }
                }
            })

            if (!createInitialInfo || !createInitialReferralRewards) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Faild to create initial user info"
            })
            if (referalCode) cookies().delete("inviter")

            const data = {
                ...createInitialInfo,
                birth_date: createInitialInfo.birth_date.toISOString(),
                id_image: undefined,
                created_at: createInitialInfo.created_at.toISOString(),
                updated_at: createInitialInfo.updated_at.toISOString(),
                status: createInitialInfo.status as string
            }

            return data

        }

        const data = {
            ...userInfo,
            birth_date: userInfo.birth_date.toISOString(),
            id_image: undefined,
            created_at: userInfo.created_at.toISOString(),
            updated_at: userInfo.updated_at.toISOString(),
            status: userInfo.status as string
        }

        return data

    }),
    updateUserWallet: publicProcedure.input(z.string().optional()).query(async ({ input }) => {
        const user = await getUserId()
        if (!user) throw new TRPCError({
            code: "UNAUTHORIZED"
        })

        if (!input) return okayRes()

        const userInfo = await db.user_info.findUnique({
            where: { user_id: user }
        })
        if (!userInfo) throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found"
        })

        if (userInfo.wallet !== input) {
            await db.user_info.update({
                where: { user_id: user },
                data: { wallet: input }
            })
        }
        return okayRes()
    }),
    updateUserInfo: publicProcedure.input(z.object({
        first_name: z.string(),
        last_name: z.string(),
        email: z.string(),
        mobile: z.string(),
        age: z.string(),
        birth_date: z.string(),
    })).mutation(async (opts) => {

        try {


            const data = opts.input

            await rateLimiter.consume(1)

            const user = await getUserId()
            if (!user) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            const getUser = await db.user_info.findUnique({ where: { user_id: user } })
            if (!getUser) throw new TRPCError({
                code: "NOT_FOUND",
                message: "User not found"
            })

            if (getUser.verified_attemp > 2) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "You have reached your max revalidation attempt."
            })

            //update userinfo
            const updateUserInfo = await db.user_info.update({
                where: {
                    user_id: user
                }, data: {
                    ...data,
                    status: ProfileStatus['PENDING'],
                    verified_attemp: {
                        increment: 1
                    },
                    verification_message: ""
                }
            })
            if (!updateUserInfo) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Failed to create or update user info"
            })

            return true

        } catch (error: any) {
            throw new TRPCError({
                code: error.code || "INTERNAL_SERVER_ERROR",
                message: error.message || "Server Error"
            })
        } finally {
            await db.$disconnect()
        }

    }),
    getAllUsers: publicProcedure.input(
        z.object({
            page: z.string().min(1).optional().default('1'),
            first_name: z.string().optional(),
            last_name: z.string().optional(),
            email: z.string().optional(),
            status: z.string().optional(),
        })
    ).query(async ({ input }) => {

        const { page, status, first_name, last_name, email } = input, limit = 10

        try {

            const auth = await getAuth()
            if (!auth) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            // Create the filter object
            const filter: any = {
                NOT: { status: ProfileStatus.INCOMPLETE },
                AND: [
                    { status: status?.toUpperCase() },
                    { first_name: { contains: first_name?.toLocaleLowerCase() } },
                    { last_name: { contains: last_name?.toLocaleLowerCase() } },
                    { email: { contains: email?.toLocaleLowerCase() } },
                ]
            };

            const users = await db.user_info.findMany({
                where: filter,
                orderBy: { created_at: 'desc' },
                skip: (Number(page) - 1) * limit, // Skip records for pagination
                take: limit,              // Limit the number of records returned
            });

            const totalUsers = await db.user_info.count({ where: filter });

            const hasNextPage = (Number(page) * limit) < totalUsers;
            const hasPreviousPage = Number(page) > 1;
            const totalPages = Math.ceil(totalUsers / limit);

            return {
                data: users,
                pagination: {
                    total: totalUsers,
                    page,
                    hasNextPage,
                    hasPreviousPage,
                    totalPages
                }
            };

        } catch (error: any) {
            console.log(error);
            throw new TRPCError({
                code: error.code || "INTERNAL_SERVER_ERROR",
                message: error.message || "Server error"
            })
        } finally {
            await db.$disconnect()
        }
    }),
    updateUserStatus: publicProcedure.input(z.object({
        user_id: z.string(),
        status: z.string(),
        message: z.string().optional()

    })).mutation(async ({ input }) => {

        try {

            await rateLimiter.consume(1)

            const auth = await getAuth()
            if (!auth) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            const getProfileStatusMessage = (profileStatus: string) => {
                if (profileStatus === ProfileStatus['VERIFIED']) {
                    return 'Awesome! Your profile is all set and verified! 🎉';
                }
                return 'Your profile status is invalid. Please check your information.';
            }

            const message = getProfileStatusMessage(input.status)

            //update user status
            const [updateUser, _] = await Promise.all([

                db.user_info.update({
                    where: { user_id: input.user_id },
                    data: {
                        status: input.status as ProfileStatus,
                        verification_message: input.message
                    }
                }),
                db.user_notification.create({
                    data: {
                        user: {
                            connect: {
                                user_id: input.user_id
                            }
                        },
                        message: message,
                        link: "/dashboard/profile",
                        from: "Stylus Investments"
                    }
                })
            ])
            if (!updateUser) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Failed to update user"
            })

            return true

        } catch (error: any) {
            console.log(error);
            throw new TRPCError({
                code: error.code || "INTERNAL_SERVER_ERROR",
                message: error.message || "Server error"
            })
        } finally {
            await db.$disconnect()
        }
    }),
    updateProfileID: publicProcedure.input(z.object({
        front_id: z.string().optional(),
        back_id: z.string().optional(),
    })).mutation(async ({ input }) => {
        try {

            await rateLimiter.consume(1)

            const auth = await getUserId()
            if (!auth) throw new TRPCError({
                code: "UNAUTHORIZED"
            })

            const user = await db.user_info.findUnique({ where: { user_id: auth } })
            if (!user) throw new TRPCError({
                code: 'NOT_FOUND',
                message: "User not found"
            })
            const updateUser = await db.user_info.update({
                where: {
                    user_id: auth
                }, data: {
                    front_id: input.front_id,
                    back_id: input.back_id
                }
            })
            if (!updateUser) throw new TRPCError({
                code: 'BAD_REQUEST',
                message: "Failed to update profile ID"
            })
            const utapi = new UTApi()

            if (input.front_id && user.front_id) {
                const urlParts = user.front_id.split('/');
                const key = urlParts[urlParts.length - 1];
                await utapi.deleteFiles(key);
            }
            if (input.back_id && user.back_id) {
                const urlParts = user.back_id.split('/');
                const key = urlParts[urlParts.length - 1];
                await utapi.deleteFiles(key);
            }

            return true

        } catch (error: any) {
            console.log(error);
            throw new TRPCError({
                code: error.code || "INTERNAL_SERVER_ERROR",
                message: error.message || "Server error"
            })
        } finally {
            await db.$disconnect()
        }
    }),
    claimGass: publicProcedure.mutation(async () => {

        const provider = new ethers.JsonRpcProvider(process.env.MORALIS_RPC_URL); // Your RPC URL
        const wallet = new ethers.Wallet(process.env.GAS_WALLET_PRIVATE_KEY as string, provider); // Wallet used to send gas fees

        await rateLimiter.consume(1)

        const auth = await getUserId()
        if (!auth) throw new TRPCError({
            code: "UNAUTHORIZED"
        })

        const user = await db.user_info.findUnique({ where: { user_id: auth } })
        if (!user) throw new TRPCError({
            code: 'NOT_FOUND',
            message: "User not found"
        })

        if (user.claimed_gass) throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Gas fee already claimed."
        })

        const response = await axios.get(
            'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
        );
        const ethPriceInUSD = response.data.ethereum.usd;

        // Step 2: Calculate the amount of ETH equivalent to $0.30
        const gasFeeInUSD = 0.20;
        const gasFeeAmount = ethers.parseEther((gasFeeInUSD / ethPriceInUSD).toFixed(8)); // Convert to ETH

        // Step 3: Send the gas fee to the user's wallet
        const tx = await wallet.sendTransaction({
            to: user.wallet,
            value: gasFeeAmount,
        });

        console.log("Transaction sent:", tx.hash);

        // Step 4: Wait for the transaction to be mined
        await tx.wait();

        console.log("Transaction confirmed:", tx.hash);

        await db.user_info.update({
            where: { user_id: user.user_id },
            data: { claimed_gass: true }
        })

        // Step 5: Return the transaction hash
        return true

    }),
    checkGas: publicProcedure.query(async () => {
        await rateLimiter.consume(1)

        const auth = await getUserId()
        if (!auth) throw new TRPCError({
            code: "UNAUTHORIZED"
        })

        const user = await db.user_info.findUnique({ where: { user_id: auth } })
        if (!user) throw new TRPCError({
            code: 'NOT_FOUND',
            message: "User not found"
        })

        return user.claimed_gass

    }),
    rechargeFee: publicProcedure.input(z.object({
        data: compoundFormSchema,
        hash: z.string().min(1, {
            message: "Transaction hash is required"
        })
    })).mutation(async ({ input }) => {
        const provider = new ethers.JsonRpcProvider(process.env.MORALIS_RPC_URL); // Your RPC URL

        const txReceipt = await provider.getTransactionReceipt(input.hash);

        await rateLimiter.consume(1)


        const auth = await getUserId()
        if (!auth) throw new TRPCError({
            code: "UNAUTHORIZED"
        })


        const [user] = await Promise.all([
            db.user_info.findUnique({ where: { user_id: auth } }),
        ])
        if (!user) throw new TRPCError({
            code: 'NOT_FOUND',
            message: "User not found"
        })

        await db.user_info.update({
            where: {
                user_id: auth
            },
            data: {
                gas_credits: {
                    increment: Number(input.data.amount)
                }
            }
        })

        return true
    }),
    useGasCreditFee: publicProcedure.input(z.object({
        gasAmount: z.string()
    })).mutation(async ({ input }) => {
        await rateLimiter.consume(1)

        const auth = await getUserId()
        if (!auth) throw new TRPCError({
            code: "UNAUTHORIZED"
        })

        const [user] = await Promise.all([
            db.user_info.findUnique({ where: { user_id: auth } }),
        ])

        console.log(user)
        if (!user) throw new TRPCError({
            code: 'NOT_FOUND',
            message: "User not found"
        })

        // if (!user.gas_credits) throw new TRPCError({
        //     code: "BAD_REQUEST",
        //     message: "You don't have enough processing fee to continue this transaction. Please recharge."
        // })

        const provider = new ethers.JsonRpcProvider(process.env.MORALIS_RPC_URL); // Your RPC URL
        const wallet = new ethers.Wallet(process.env.ASSET_WALLET_PRIVATE_KEY as string, provider); // Wallet used to send gas fees


        await rateLimiter.consume(1)

        // Create contract instance
        const recipient = user.wallet;
        const amount = input.gasAmount


        const amountInWei = ethers.parseUnits(amount, "ether"); // Convert ETH to Wei

        console.log("Amount in wei", amountInWei)

        const newGasAmount = amountInWei * BigInt(130) / BigInt(100); // Increase by 30%

        try {
            // Create and send the transaction
            const tx = await wallet.sendTransaction({
                to: recipient,
                value: newGasAmount, // Amount of ETH to send
            });
        // Wait for transaction to be mined

            await tx.wait();
            console.log("ETH sent successfully:", tx);

        } catch (error) {
            console.error("Transaction failed:", error);
        }


        // await db.user_info.update({
        //     where: {
        //         user_id: auth
        //     },
        //     data: {
        //         gas_credits: {
        //             decrement: 1
        //         }
        //     }
        // })

        return true;
    })
}



