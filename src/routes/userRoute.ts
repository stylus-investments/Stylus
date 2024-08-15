import { publicProcedure } from "@/trpc/trpc";
import { privy } from "@/lib/privy";

export const userRoute = {
    test: publicProcedure.query(async () => {
        return true
    })
}