import { createCaller } from '../server/trpc'
import { appRouter } from '../server';

export const serverClient = createCaller(appRouter)

export const caller = serverClient({})