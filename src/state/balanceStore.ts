import { IconDefinition, faDollarSign, faPesoSign } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import { create } from 'zustand'

const exchangeApiKey = process.env.NEXT_PUBLIC_EXCHANGE_APIKEY

interface BalanceStoreProps {
    currency: string
    setCurrency: (currency: string) => void,
    availableCurrency: {
        currency: string;
        icon: IconDefinition;
    }[]
    conversionRate: number
    getConvertedBalance: (balance: string) => string
    getConversionRate: (currency: string) => Promise<void>

}

const useBalanceStore = create<BalanceStoreProps>((set, get) => ({
    getConversionRate: async (currency: string) => {
        
        try {

            if (currency === 'USD') {
                set({ conversionRate: 1 })
            } else {

                const { data } = await axios.get(`https://v6.exchangerate-api.com/v6/${exchangeApiKey}/pair/USD/${currency}`)

                set({ conversionRate: data.conversion_rate as number })
            }

        } catch (error) {
            console.log(error);
            alert("Something went wrong converting balance")
        }
    },
    currency: "USD",
    setCurrency: (currency: string) => set({ currency }),
    availableCurrency: [
        {
            currency: 'USD',
            icon: faDollarSign,
        },
        {
            currency: 'PHP',
            icon: faPesoSign,
        },
    ],
    conversionRate: 1,
    getConvertedBalance: (amount: string) => {

        const { conversionRate } = get()

        return (Number(amount) * conversionRate).toString()

    }
}))

export default useBalanceStore