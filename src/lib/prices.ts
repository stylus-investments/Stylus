import Moralis from "moralis";
import { TRPCError } from "@trpc/server";
import axios from "axios";
import db from "@/db/db";
import { BASE_CHAIN_ID, USDC_ADDRESS } from "./token_address";
import { calculateBalanceArray } from "./balances";
import { currency_conversion } from "@prisma/client";

const getIndexPrice = ({ btc_price, usdc_price, php_converstion }: {
    btc_price: number
    usdc_price: number
    php_converstion: string
}) => {

    const btc_shot = 100000
    const btc_market = btc_price
    const btc_delta = btc_market / btc_shot * 100
    const btc_weight = (btc_delta - 100) / 2

    const usdc_shot = 1
    const usdc_market = usdc_price
    const usdc_delta = usdc_market / usdc_shot * 100
    const usdc_weight = (usdc_delta - 100) / 4

    const asset_weight = btc_weight + usdc_weight
    const decimal = asset_weight / 100;

    const index = (1 + 1 * decimal);
    const indexPrice = index / Number(php_converstion)

    return {
        'php': index,
        'usd': indexPrice
    }
}

const getTokenValue = async (tokenSymbol: string) => {

    try {

        if (tokenSymbol === 'sbtc') {

            const url = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&precision=full&include_24hr_change=true`;
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

            const indexPrices = getIndexPrice({ btc_price: bitcoin.data.bitcoin.usd, usdc_price: usdc.raw.usdPrice, php_converstion: conversionRate.conversion_rate })

            return indexPrices.usd.toFixed(6)
        }

        const [usdc, phpConversionRate, hkdConversionRate] = await Promise.all([
            Moralis.EvmApi.token.getTokenPrice({
                chain: BASE_CHAIN_ID,
                address: USDC_ADDRESS
            }),
            db.currency_conversion.findFirst({
                where: {
                    currency: "PHP"
                }
            }),
            db.currency_conversion.findFirst({
                where: {
                    currency: "HKD"
                }
            })
        ])
        if (!phpConversionRate || !hkdConversionRate) throw new TRPCError({
            code: "NOT_FOUND"
        })

        const usdc_market = usdc.raw.usdPrice

        switch (tokenSymbol) {
            case 'usdc':
                return usdc_market.toFixed(6)
            case 'sphp':
                return (usdc_market / Number(phpConversionRate.conversion_rate)).toFixed(6)
            case 'save':
                return usdc_market.toFixed(6)
            case 'shkd':
                return (usdc_market / Number(hkdConversionRate.conversion_rate)).toFixed(6)
        }

        return '0.00'

    } catch (error) {
        return '0.00'
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

interface UserTokenData {
    tokenAddress: string
    walletAddress: string
    chain: string
    tokenSymbol: string
    tokenName: string
    tokenLogo: string
    currencyExchangeRate: currency_conversion[]
}


const getUserTokenData = async (props: UserTokenData) => {

    const {
        tokenAddress,
        chain,
        walletAddress,
        currencyExchangeRate,
        tokenSymbol,
        tokenName,
        tokenLogo
    } = props

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

        console.log(tokenData, userToken, tokenName)

        const tokenPrice = tokenData?.raw.usdPriceFormatted || "0.00"
        const userTokenData = userToken.raw[0]
        const balance = userTokenData ? Number(userTokenData.balance) : 0.00;
        const decimals = userTokenData ? userTokenData.decimals : 0;
        const formatBalance = decimals > 0 ? balance / (10 ** decimals) : 0;
        const amount = isNaN(formatBalance) ? "0.0000" : formatBalance.toFixed(6);

        const tokenValue = await getTokenValue(tokenSymbol.toLocaleLowerCase())

        const tokenValueArray = calculateBalanceArray({ currencyExchangeRate, balance: tokenValue })
        // console.log(tokenValueArray, tokenName)
        const totalValueArray = calculateBalanceArray({ currencyExchangeRate, balance: (Number(tokenValue) * Number(amount)).toFixed(6) })

        let tokenChange: string

        if (tokenSymbol.toLocaleLowerCase() === 'sbtc') {
            const url = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&precision=full&include_24hr_change=true`;
            const data = await axios.get(url, {
                headers: {
                    'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
                }
            })

            tokenChange = (Number(data.data.bitcoin.usd_24h_change) / 2.1).toFixed(4)
        } else {

            const url = `https://api.coingecko.com/api/v3/simple/token_price/base?contract_addresses=${USDC_ADDRESS}&include_24hr_change=true&vs_currencies=usd`;
            const data = await axios.get(url, {
                headers: {
                    'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
                }
            })

            const change = data.data['0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'].usd_24h_change

            if (tokenSymbol.toLocaleLowerCase() === 'sphp') {

                const phpRate = currencyExchangeRate.find(currency => currency.currency === 'PHP')
                if (phpRate) {
                    const decimalChange = change / 100;
                    const amountChangeInPHP = decimalChange * Number(phpRate.conversion_rate); // Change in PHP
                    tokenChange = amountChangeInPHP.toFixed(4)
                } else {
                    tokenChange = change.toFixed(4)
                }
            } else {
                tokenChange = change.toFixed(4)
            }
        }

        const data = {
            amount,
            value: tokenValue,
            value_array: tokenValueArray,
            total_value: (Number(tokenValue) * Number(amount)).toFixed(6),
            total_value_array: totalValueArray,
            price: tokenPrice,
            name: tokenName,
            logo: tokenLogo,
            symbol: tokenSymbol,
            change: tokenChange,
            address: tokenAddress
        }

        return data

    } catch (error) {

        const amount = "0.00000"
        const tokenValue = await getTokenValue(tokenSymbol.toLocaleLowerCase())
        const tokenValueArray = calculateBalanceArray({ currencyExchangeRate, balance: tokenValue })
        const totalValueArray = calculateBalanceArray({ currencyExchangeRate, balance: (Number(tokenValue) * Number(amount)).toFixed(6) })
        const tokenPrice = "0.00"

        let tokenChange: string

        if (tokenSymbol.toLocaleLowerCase() === 'sbtc') {
            const url = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&precision=full&include_24hr_change=true`;
            const data = await axios.get(url, {
                headers: {
                    'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
                }
            })

            tokenChange = (Number(data.data.bitcoin.usd_24h_change) / 2.1).toFixed(4)
        } else {

            const url = `https://api.coingecko.com/api/v3/simple/token_price/base?contract_addresses=${USDC_ADDRESS}&include_24hr_change=true&vs_currencies=usd`;
            const data = await axios.get(url, {
                headers: {
                    'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
                }
            })

            const change = data.data['0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'].usd_24h_change

            if (tokenSymbol.toLocaleLowerCase() === 'sphp') {

                const phpRate = currencyExchangeRate.find(currency => currency.currency === 'PHP')
                if (phpRate) {
                    const decimalChange = change / 100;
                    const amountChangeInPHP = decimalChange * Number(phpRate.conversion_rate); // Change in PHP
                    tokenChange = amountChangeInPHP.toFixed(4)
                } else {
                    tokenChange = change.toFixed(4)
                }
            } else {
                tokenChange = change.toFixed(4)
            }
        }

        const data = {
            amount,
            value: tokenValue,
            value_array: tokenValueArray,
            total_value: (Number(tokenValue) * Number(amount)).toFixed(6),
            total_value_array: totalValueArray,
            price: tokenPrice,
            name: tokenName,
            logo: tokenLogo,
            symbol: tokenSymbol,
            change: tokenChange,
            address: tokenAddress
        }

        return data


    }
}

const getCurrentBalance = async ({
    totalSHKD = '0.00',
    totalSAVE = '0.00',
    // totalSBTC = '0.00',
    totalSPHP = '0.00'
}: {
    totalSHKD: string | undefined
    totalSAVE: string | undefined
    // totalSBTC: string | undefined
    totalSPHP: string | undefined
}) => {

    try {

        const url = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&precision=full`;

        const [bitcoin, usdc, phpConversionRate, hkdConversionRate] = await Promise.all([
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
            }),
            db.currency_conversion.findFirst({
                where: {
                    currency: "HKD"
                }
            }),
        ])
        if (!phpConversionRate || !hkdConversionRate) throw new TRPCError({
            code: "NOT_FOUND"
        })

        const indexPrice = getIndexPrice({ btc_price: bitcoin.data.bitcoin.usd, usdc_price: usdc.raw.usdPrice, php_converstion: phpConversionRate.conversion_rate })

        // const convertedSbtcPrice = indexPrice.usd * Number(totalSBTC)
        // const usdcConvertedPrice = Number(usdc.raw.usdPrice) * Number(totalUSDC)
        const convertedShkdPrice = Number(Number(totalSHKD) / Number(hkdConversionRate.conversion_rate))
        const convertedSavePrice = Number(usdc.raw.usdPrice) * Number(totalSAVE)
        const convertedSphpPrice = Number(totalSPHP) / Number(phpConversionRate.conversion_rate);

        return (convertedShkdPrice + convertedSavePrice + convertedSphpPrice).toString()

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


export { getCurrentBalance, getUserTokenData, getRewardsAccumulated, getTokenPrice, getIndexPrice }