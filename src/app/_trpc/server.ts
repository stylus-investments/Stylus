import { createCaller } from '../../trpc/trpc'
import { appRouter } from '../../trpc';

export const serverClient = createCaller(appRouter)

export const caller = serverClient({})