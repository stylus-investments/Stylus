import { AppRouter } from "@/trpc";
import { inferRouterOutputs } from "@trpc/server";
export type RouterOutputs = inferRouterOutputs<AppRouter>;
