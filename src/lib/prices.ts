import Moralis from "moralis";
import { getMoralis } from "./moralis"
import { TRPCError } from "@trpc/server";
import axios from "axios";
import db from "@/db/db";
import { BASE_CHAIN_ID, USDC_ADDRESS } from "./token_address";

const getTokenValue = async (tokenName: string) => {

    try {

        const url = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&precision=full`;

        const [bitcoin, usdc, conversionRate] = await Promise.all([
            axios.get(url, {
                headers: {
                    'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
                }
            }),
            Moralis.EvmApi.token.getTokenPrice({
                chain: BASE_CHAIN_ID,
                address: USDC_ADDRESS
            }),
            db.currency_conversion.findFirst({
                where: {
                    currency: "PHP"
                }
            })
        ])
        if (!conversionRate) throw new TRPCError({
            code: "NOT_FOUND"
        })

        const btc_shot = 50000
        const btc_market = bitcoin.data.bitcoin.usd
        const btc_delta = btc_market / btc_shot * 100
        const btc_weight = (btc_delta - 100) / 2

        const usdc_shot = 1
        const usdc_market = usdc.raw.usdPrice
        const usdc_delta = usdc_market / usdc_shot * 100
        const usdc_weight = (usdc_delta - 100) / 4

        const asset_weight = btc_weight + usdc_weight
        const decimal = asset_weight / 100;

        const index = (1 + 1 * decimal);

        switch (tokenName) {
            case 'sbtc':
                return index.toFixed(6)
            case 'usdc':
                return usdc_market.toFixed(6)
            case 'sphp':
                return (1 / Number(conversionRate.conversion_rate)).toFixed(6)
            case 'save':
                return usdc_market.toFixed(6)
        }

        return 0

    } catch (error) {
        return 0
    }
}


const getTokenPrice = async ({ tokenAddress, chain }: {
    tokenAddress: string
    chain: string
}) => {

    try {

        const tokenData = await Moralis.EvmApi.token.getTokenPrice({
            chain: chain,
            address: tokenAddress
        })

        return tokenData

    } catch (err) {
        return null
    }
}

const getUserTokenData = async ({ tokenAddress, chain, walletAddress }: {
    tokenAddress: string
    walletAddress: string
    chain: string
}) => {

    try {

        const [tokenData, userToken] = await Promise.all([
            getTokenPrice({ tokenAddress, chain }),
            Moralis.EvmApi.token.getWalletTokenBalances({
                chain: chain,
                address: walletAddress,
                tokenAddresses: [
                    tokenAddress
                ],
            })
        ])

        if (userToken) {

            const tokenPrice = tokenData?.raw.usdPriceFormatted || "0.00"
            const userTokenData = userToken.raw[0]
            const balance = Number(userTokenData.balance);
            if (!balance) return null
            const decimals = userTokenData.decimals;
            const formatBalance = decimals > 0 ? balance / (10 ** decimals) : 0;
            const amount = isNaN(formatBalance) ? "0.0000" : formatBalance.toFixed(6);
            const tokenValue = await getTokenValue(userTokenData.symbol.toLocaleLowerCase())

            return {
                amount,
                value: tokenValue,
                total_value: (Number(tokenValue) * Number(amount)).toFixed(6),
                price: tokenPrice,
                name: userTokenData.name,
                logo: userTokenData.logo,
                symbol: userTokenData.symbol,
                change: tokenData?.raw["24hrPercentChange"] || "0.00"
            }

        } else {
            return null
        }


    } catch (error) {
        return null
    }
}

const getCurrentBalance = async ({ totalUSDC = '0.00', totalSAVE = '0.00', totalSBTC = '0.00', totalSPHP = '0.00' }: {
    totalUSDC: string | undefined
    totalSAVE: string | undefined
    totalSBTC: string | undefined
    totalSPHP: string | undefined
}) => {

    try {

        const url = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&precision=full`;

        const [bitcoin, usdc, conversionRate] = await Promise.all([
            axios.get(url, {
                headers: {
                    'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
                }
            }),
            Moralis.EvmApi.token.getTokenPrice({
                chain: BASE_CHAIN_ID,
                address: USDC_ADDRESS
            }),
            db.currency_conversion.findFirst({
                where: {
                    currency: "PHP"
                }
            })
        ])
        if (!conversionRate) throw new TRPCError({
            code: "NOT_FOUND"
        })

        const btc_shot = 50000
        const btc_market = bitcoin.data.bitcoin.usd
        const btc_delta = btc_market / btc_shot * 100
        const btc_weight = (btc_delta - 100) / 2

        const usdc_shot = 1
        const usdc_market = usdc.raw.usdPrice
        const usdc_delta = usdc_market / usdc_shot * 100
        const usdc_weight = (usdc_delta - 100) / 4

        const asset_weight = btc_weight + usdc_weight
        const decimal = asset_weight / 100;

        const index = (1 + 1 * decimal);

        const convertedSbtcPrice = index * Number(totalSBTC)
        const usdcConvertedPrice = Number(usdc_market) * Number(totalUSDC)
        const convertedSavePrice = Number(usdc_market) * Number(totalSAVE)
        const convertedSphpPrice = Number(totalSPHP) / Number(conversionRate.conversion_rate);

        return (usdcConvertedPrice + convertedSavePrice + convertedSbtcPrice + convertedSphpPrice).toString()

    } catch (error) {
        return null
    }
}

const getRewardsAccumulated = ({ usdcPrice = '1', totalEarn = '0.00', totalSvn = '0.00' }: {
    usdcPrice: string
    totalEarn: string | undefined
    totalSvn: string | undefined
}) => {

    const earnConvertedPrice = Number(usdcPrice) * Number(totalEarn)
    const svnConvertedPrice = (Number(totalSvn) * 0.002)

    return (earnConvertedPrice + svnConvertedPrice).toString()

}


export { getCurrentBalance, getUserTokenData, getRewardsAccumulated, getTokenPrice }