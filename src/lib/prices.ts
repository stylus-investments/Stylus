import Moralis from "moralis";
import { getMoralis } from "./moralis"

const getUserTokenData = async ({ tokenAddress, tokenName, chain, walletAddress }: {
    tokenAddress: string
    walletAddress: string
    tokenName: string
    chain: string
}) => {

    try {

        await getMoralis()

        const [tokenData, userToken] = await Promise.all([

            Moralis.EvmApi.token.getTokenPrice({
                chain: chain,
                address: tokenAddress
            }),
            Moralis.EvmApi.token.getWalletTokenBalances({
                chain: chain,
                address: walletAddress
            })
        ])

        const userTokenData: any = userToken.raw.find((token: any) => token.token_address.toLowerCase() === tokenAddress.toLowerCase()) || {};
        const tokenPrice = tokenData.raw.usdPriceFormatted || "0.0000"
        const totalTokenValue = Number(tokenPrice) * Number(userTokenData.balance) || 0;

        const balance = Number(userTokenData?.balance ?? 0);
        const decimals = userTokenData?.decimals ?? 0;
        const formatBalance = decimals > 0 ? balance / (10 ** decimals) : 0;
        const amount = isNaN(formatBalance) ? "0.0000" : formatBalance.toFixed(6);

        const formatTokenValue = decimals > 0 ? totalTokenValue / (10 ** decimals) : 0;
        const formattedValue = formatTokenValue.toFixed(6) || "0.000000";

        return {
            amount,
            value: formattedValue,
            price: tokenPrice,
            name: tokenData.raw.tokenName || "",
            logo: tokenData.raw.tokenLogo || "/save.webp",
            symbol: tokenData.raw.tokenSymbol || "",
            change: tokenData.raw["24hrPercentChange"] || "0.00"
        }

    } catch (error) {

        const userToken = await Moralis.EvmApi.token.getWalletTokenBalances({
            chain: chain,
            address: walletAddress
        })

        const userTokenData: any = userToken.raw.find((token: any) => token.token_address.toLowerCase() === tokenAddress.toLowerCase()) || {};

        const balance = Number(userTokenData?.balance ?? 0);
        const decimals = userTokenData?.decimals ?? 0;
        const formatBalance = decimals > 0 ? balance / (10 ** decimals) : 0;
        const amount = isNaN(formatBalance) ? "0.0000" : formatBalance.toFixed(6);

        return {
            amount,
            value: "0.000000",
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