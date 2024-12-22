import { cashout_method } from "@prisma/client";
import { z } from "zod";

export const cashoutFormSchema = z.object({
    account_name: z.string().min(1, {
        message: "Name is required"
    }),
    account_number: z.string().min(1, {
        message: 'Account number is required'
    }
    ),
    payment_method: z.enum([cashout_method.BPI, cashout_method.GCASH], {
        message: "Select Payment Method"
    }),
    amount: z.string().min(1, {
        message: 'Amount must be greater than 0'
    }),
    token_name: z.string().min(1, {
        message: "Select token to cashout."
    }),
    note: z.string().optional(),
});



export type tCashoutFormSchema = z.TypeOf<typeof cashoutFormSchema>;
