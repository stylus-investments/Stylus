import axios from "axios";
import Moralis from "moralis";
import 'dotenv/config'
import { BASE_CHAIN_ID } from "./token_address";
interface TokenHolders {
    balance: string
    balance_formatted: string
    is_contract: boolean
    owner_address: string
    owner_address_label: string | null
    usd_value: string | null
    percentage_relative_to_total_supply: number
}

let isMoralisInitialized = false;

const getMoralis = async () => {
    if (!isMoralisInitialized) {
        await Moralis.start({
            apiKey: process.env.MORALIS_API_KEY as string
        });
        isMoralisInitialized = true;
    }
}

const getTokenHolders = async (tokenAddress: string) => {

    try {

        await getMoralis()

        const { data } = await axios.get(`https://deep-index.moralis.io/api/v2.2/erc20/${tokenAddress}/owners?&order=DESC`, {
            params: {
                chain: BASE_CHAIN_ID
            },
            headers: {
                'x-api-key': process.env.MORALIS_API_KEY
            }
        })

        return data.result as TokenHolders[]

    } catch (error) {
        console.error("getTokenHoldersError", error)
    }
}

export {
    getTokenHolders, getMoralis
}