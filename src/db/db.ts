import { PrismaClient } from "@prisma/client";
import { readReplicas } from '@prisma/extension-read-replicas'

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient()
    .$extends(
        readReplicas({
            url: process.env.REPLICA_DATABASE_URL as string
        })
    )

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export default db