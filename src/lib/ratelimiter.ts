import { RateLimiterMemory } from "rate-limiter-flexible";

const opts = {
    points: 30,
    duration: 30
}

export const rateLimiter = new RateLimiterMemory(opts)