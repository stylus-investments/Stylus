import Moralis from "moralis";
import { getMoralis } from "./moralis"

const getTokenPrice = async (tokenAddress: string) => {

    await getMoralis()

    const response = await Moralis.EvmApi.token.getTokenPrice({
        chain: process.env.CHAIN,
        address: tokenAddress
    });

    const tokenPrice = response.raw.usdPriceFormatted

    return tokenPrice || "0.00"
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




const getFormattedBalance = ({ balance, decimal }: any) => {
    if (balance && decimal) {
        const formatBalance = Number(balance) / (10 ** decimal)
        return formatBalance.toString()
    }
    return "0.0000000000"
}


export { getCurrentBalance, getFormattedBalance, getTokenPrice, getRewardsAccumulated }