import axios from "axios";
import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/common-evm-utils";

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
            apiKey: process.env.MORALIS_API_KEY
        });

        const stream = {
            chains: [EvmChain.BASE],
            description: "Growpoint webhook",
            tag: "grow",
            webhookUrl: "/api/t"
        }
        isMoralisInitialized = true;
    }
}

const getTokenHolders = async () => {

    try {

        const { data } = await axios.get(`https://deep-index.moralis.io/api/v2.2/erc20/${process.env.GO_ADDRESS}/owners?&order=DESC`, {
            params: {
                chain: process.env.CHAIN
            },
            headers: {
                'x-api-key': process.env.MORALIS_API_KEY
            }
        })

        return data.result as TokenHolders[]

    } catch (error) {
        console.log(error);
    }
}

export {
    getTokenHolders, getMoralis
}