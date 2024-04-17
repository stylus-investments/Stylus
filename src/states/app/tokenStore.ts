import axios from 'axios';
import { create } from 'zustand'

interface TokenInfo {
    token_address: string;
    symbol: string;
    name: string;
    logo: string | null;
    thumbnail: string | null;
    decimals: number;
    balance: string;
    possible_spam: boolean;
    verified_contract: boolean;
    balance_formatted: string;
    usd_price: number;
    usd_price_24hr_percent_change: number;
    usd_price_24hr_usd_change: number;
    usd_value: number;
    usd_value_24hr_usd_change: number;
    total_supply: string | null;
    total_supply_formatted: string | null;
    percentage_relative_to_total_supply: number | null;
    native_token: boolean;
    portfolio_percentage: number;
};

interface TokenProps {
    getTokens: () => Promise<void>
    tokens: TokenInfo[] | null
    clearToken: () => void
}

const useTokenStore = create<TokenProps>((set, get) => ({
    tokens: null,
    getTokens: async () => {
        try {
            const { data } = await axios.get('/api/token')

            if (data.ok) set({ tokens: data.data })

        } catch (error) {
            console.log(error);
            alert("Something went wrong")
        }
    },
    clearToken: () => set({ tokens: null })
}))

export default useTokenStore