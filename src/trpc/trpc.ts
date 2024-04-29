import { initTRPC } from '@trpc/server'

const t = initTRPC.create()

const router = t.router
const publicProcedure = t.procedure
const createCaller = t.createCallerFactory

export { router, publicProcedure, createCaller }