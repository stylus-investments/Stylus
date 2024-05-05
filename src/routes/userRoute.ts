import { publicProcedure } from "@/trpc/trpc";
import db from "@/db/db";
import { TRPCError } from "@trpc/server";

export const userRoute = {
    getAll: publicProcedure.query(async () => {

        try {

            const users = await db.user.findMany({
                select: {
                    id: true,
                    wallet: true,
                    created_at: true,
                    snapshots: {
                        select: {
                            id: true,
                            status: true
                        }
                    }
                },
                orderBy: {
                    created_at: 'desc'
                }
            })
            if (!users) throw new TRPCError({
                code: 'BAD_REQUEST',
                message: "Faild to get all users"
            })

            const modifyUser = users.map(user => {

                const forfietCount = user.snapshots.filter(snapshot => snapshot.status === 0).length;

                return {
                    ...user,
                    snapshots: undefined,
                    forfiet_count: forfietCount,
                    total_snapshots: user.snapshots.length
                }
            })

            return modifyUser


        } catch (error: any) {
            console.log(error);
            throw new TRPCError({
                code: error.code,
                message: error.message
            })
        } finally {
            await db.$disconnect()
        }

    })
}