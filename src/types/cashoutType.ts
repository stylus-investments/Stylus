import { z } from "zod";

export const cashoutFormSchema = z.object({
    account_name: z.string().min(1, {
        message: "Name is required"
    }),
    account_number: z.string().min(1, {
        message: 'Account number is required'
    }
    ),
    payment_method: z.string().min(1, {
        message: "Enter Payment Method (Bank,Gcash, Etc..)"
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

export const compoundFormSchema = z.object({
    amount: z.string().min(1, {
        message: 'Amount must be greater than 0'
    }),
    token_name: z.string().min(1, {
        message: "Select token to cashout."
    }),
})
export type tCompoundFormSchema = z.TypeOf<typeof compoundFormSchema>