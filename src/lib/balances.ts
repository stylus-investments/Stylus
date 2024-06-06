import { currency_conversion } from "@prisma/client";

// Function to calculate balance array
const calculateBalanceArray = ({ currencyExchangeRate, balance }: {
    currencyExchangeRate: currency_conversion[]
    balance: string
}) => {

    // Map through currency exchange rates to calculate balances
    return currencyExchangeRate.map(currency => {

        const amount = (Number(currency.conversion_rate) * Number(balance)).toString()

        // Return the object with icon, currency, and balance
        return {
            currency: currency.currency,
            amount: amount
        };
    }
    )
}

export { calculateBalanceArray }