import { availableCurrencies } from "@/constant/availableCurrency";
import db from "@/db/db";
import { getUserId } from "@/lib/privy";
import { publicProcedure } from "@/trpc/trpc";
import { TRPCError } from "@trpc/server";
import axios from "axios";
import { RateLimiterMemory } from "rate-limiter-flexible";

const exchangeApiKey = process.env.CURRENCY_EXCHANGE_API_KEY

const opts = {
    points: 1,
    duration: 6 * 60 * 60, // Interval duration in seconds (6 hours)
};

const rateLimiter = new RateLimiterMemory(opts);

export const currencyRoute = {
    get: publicProcedure.query(async () => {

        const userID = await getUserId()

        if (!userID) throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Login First"
        })

        return await db.currency_conversion.findMany()
    }),
    update: publicProcedure.mutation(async () => {

        await rateLimiter.consume(1);

        const { data } = await axios.get(`https://v6.exchangerate-api.com/v6/${exchangeApiKey}/latest/USD`)

        if (!data) throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Faild to get currency conversion"
        })

        const conversionRates = Object.entries(data.conversion_rates).map(([currency, rate]) => ({
            currency: currency,
            conversion_rate: String(rate) // Directly using the rate as it is already a number
        }))

        const availableCurrencyCodes = availableCurrencies.map(c => c.currency);

        // Filter currencies that need upserting
        const currenciesToUpsert = conversionRates.filter(({ currency }) => availableCurrencyCodes.includes(currency));

        // Upsert specific currencies
        await Promise.all(currenciesToUpsert.map(({ currency, conversion_rate }) =>
            db.currency_conversion.upsert({
                where: { currency },
                update: { conversion_rate },
                create: { currency, conversion_rate }
            })
        ));

        return true
    }),
    test: publicProcedure.query(async () => {
        return true
    })
}