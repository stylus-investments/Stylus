import { availableCurrencies } from "@/constant/availableCurrency";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { currency_conversion } from "@prisma/client";

// Function to calculate balance array
function calculateBalanceArray({ currencyExchangeRate, balance }: {
    currencyExchangeRate: currency_conversion[]
    balance: string
}) {

    // Function to calculate balance for a single currency
    function calculateBalance(currency: currency_conversion) {
        // Find the corresponding available currency
        const matchingCurrency = availableCurrencies.find(ac => ac.currency === currency.currency);

        // Set the icon based on the matching currency
        const icon = matchingCurrency ? matchingCurrency.icon : faQuestionCircle;

        // Calculate the amount
        const amount = (Number(currency.conversion_rate) * Number(balance)).toString();

        // Return the object with icon, currency, and balance
        return {
            currency: currency.currency,
            amount: amount
        };
    }

    // Map through currency exchange rates to calculate balances
    return currencyExchangeRate.map(currency => calculateBalance(currency));
}

export { calculateBalanceArray }