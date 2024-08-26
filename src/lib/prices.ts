import Moralis from "moralis";
import { getMoralis } from "./moralis"

const getUserTokenData = async (tokenAddress: string, walletAddress: string, tokenName: string) => {

    try {

        await getMoralis()

        const [tokenData, userToken] = await Promise.all([

            Moralis.EvmApi.token.getTokenPrice({
                chain: process.env.CHAIN,
                address: tokenAddress
            }),
            Moralis.EvmApi.token.getWalletTokenBalances({
                chain: process.env.CHAIN,
                address: walletAddress
            })
        ])

        const userTokenData: any = userToken.raw.find((token: any) => token.token_address.toLowerCase() === tokenAddress.toLowerCase()) || {};
        const tokenPrice = tokenData.raw.usdPriceFormatted || "0.0000"
        const totalTokenValue = Number(tokenPrice) * Number(userTokenData.balance) || 0;

        const formatBalance = Number(userTokenData.balance || 0) / (10 ** userTokenData.decimals || 0)
        const formatTokenValue = totalTokenValue / (10 ** userTokenData.decimals || 0)

        return {
            amount: formatBalance.toString() || "0.00",
            value: formatTokenValue.toFixed(6),
            price: tokenPrice,
            name: tokenData.raw.tokenName || "",
            logo: tokenData.raw.tokenLogo || "/save.webp",
            symbol: tokenData.raw.tokenSymbol || "",
            change: tokenData.raw["24hrPercentChange"] || "0.00"
        }

    } catch (error) {

        const userToken = await Moralis.EvmApi.token.getWalletTokenBalances({
            chain: process.env.CHAIN,
            address: walletAddress
        })

        const userTokenData: any = userToken.raw.find((token: any) => token.token_address.toLowerCase() === tokenAddress.toLowerCase()) || {};

        const formatBalance = Number(userTokenData.balance || 0) / (10 ** userTokenData.decimals || 0)

        return {
            amount: formatBalance.toString() || "0.00",
            value: "0.0000",
            name: tokenName,
            price: "0.0000",
            logo: "/save.webp",
            symbol: tokenName,
            change: "0.00"
        }
    }



}

const getCurrentBalance = ({ usdcPrice, totalUsdc, totalSave }: {
    usdcPrice: string
    totalUsdc: string
    totalSave: string
}) => {

    const usdcConvertedPrice = Number(usdcPrice) * Number(totalUsdc)
    const convertedSavePrice = Number(usdcPrice) * Number(totalSave)

    return (usdcConvertedPrice + convertedSavePrice).toString()

}



const getRewardsAccumulated = ({ usdcPrice, totalEarn, totalSvn }: {
    usdcPrice: string
    totalEarn: string
    totalSvn: string
}) => {

    const earnConvertedPrice = Number(usdcPrice) * Number(totalEarn)
    const svnConvertedPrice = (Number(totalSvn) * 0.002)

    return (earnConvertedPrice + svnConvertedPrice).toString()

}


export { getCurrentBalance, getUserTokenData, getRewardsAccumulated }