import axios from "axios"

interface TokenHolders {
    balance: string
    balance_formatted: string
    is_contract: boolean
    owner_address: string
    owner_address_label: string | null
    usd_value: string | null
    percentage_relative_to_total_supply: number
}

//200 response
const okayRes = (data?: any) => {
    if (data) return { ok: true, data: data }

    return { ok: true }
}

const getTokenHolders = async () => {
    try {

        const { data } = await axios.get('https://deep-index.moralis.io/api/v2.2/erc20/0xb70F970876638a33859600B9E64BEAd0fD22b065/owners?&order=DESC', {
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
    okayRes,
    getTokenHolders
}