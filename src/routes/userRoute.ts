import { publicProcedure } from "@/trpc/trpc";
import db from "@/db/db";
import { TRPCError } from "@trpc/server";
import { rateLimiter } from "@/lib/ratelimiter";
import { cookies } from "next/headers";
import { privy } from "@/lib/privy";

export const userRoute = {
    test: publicProcedure.query(async () => {

        const cookieStore = cookies()
        const authToken = cookieStore.get("privy-token")?.value

        console.log("token", authToken)

        if (authToken) {

            const verifiedClaims = await privy.verifyAuthToken(authToken);

            return verifiedClaims
        }
    })
}