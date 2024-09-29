import Moralis from "moralis";
import { getMoralis } from "./moralis"

const getTokenPrice = async ({ tokenAddress, chain }: {
    tokenAddress: string
    chain: string
}) => {

    try {

        await getMoralis()

        const tokenData = await Moralis.EvmApi.token.getTokenPrice({
            chain: chain,
            address: tokenAddress
        })

        return tokenData

    } catch (err) {
        console.log(err)
        return null
    }
}

const getUserTokenData = async ({ tokenAddress, chain, walletAddress }: {
    tokenAddress: string
    walletAddress: string
    chain: string
}) => {

    try {

        await getMoralis()

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

        if (tokenData) {
            const tokenPrice = tokenData.raw.usdPriceFormatted
            if (userToken.raw.length > 0) {
                const userTokenData = userToken.raw[0]
                const totalTokenValue = Number(tokenPrice) * Number(userTokenData.balance)

                const balance = Number(userTokenData.balance);
                if (!balance) return null
                const decimals = userTokenData.decimals;
                const formatBalance = decimals > 0 ? balance / (10 ** decimals) : 0;
                const amount = isNaN(formatBalance) ? "0.0000" : formatBalance.toFixed(6);

                const formatTokenValue = decimals > 0 ? totalTokenValue / (10 ** decimals) : 0;
                const formattedValue = formatTokenValue.toFixed(6);

                return {
                    amount,
                    value: formattedValue,
                    price: tokenPrice,
                    name: tokenData.raw.tokenName,
                    logo: tokenData.raw.tokenLogo,
                    symbol: tokenData.raw.tokenSymbol,
                    change:
                        tokenData.raw["24hrPercentChange"] || "0.00"
                }
            } else {
                return null
            }
        } else {
            return null
        }


    } catch (error) {

        const userToken = await Moralis.EvmApi.token.getWalletTokenBalances({
            chain: chain,
            tokenAddresses: [
                tokenAddress
            ],
            address: walletAddress
        })

        if (userToken.result.length > 0) {

            const userTokenData = userToken.raw[0]

            const tokenPrice = "0.00"
            const totalTokenValue = Number(tokenPrice) * Number(userTokenData.balance) || 0;
            const balance = Number(userTokenData.balance);
            const decimals = userTokenData.decimals;
            const formatBalance = decimals > 0 ? balance / (10 ** decimals) : 0;
            const amount = isNaN(formatBalance) ? "0.0000" : formatBalance.toFixed(6);

            const formatTokenValue = decimals > 0 ? totalTokenValue / (10 ** decimals) : 0;
            const formattedValue = formatTokenValue.toFixed(6) || "0.000000";

            return {
                amount,
                value: formattedValue,
                price: "0.00",
                name: userTokenData.name,
                logo: `/save.webp`,
                symbol: userTokenData.symbol,
                change: 0.00
            }

        } else {
            return null
        }
    }
}

const getCurrentBalance = ({ usdcPrice = '1', totalUsdc = '0.00', totalSave = '0.00' }: {
    usdcPrice: string
    totalUsdc: string | undefined
    totalSave: string | undefined
}) => {

    const usdcConvertedPrice = Number(usdcPrice) * Number(totalUsdc)
    const convertedSavePrice = Number(usdcPrice) * Number(totalSave)

    // const totalBalance = (usdcConvertedPrice + )

    return (usdcConvertedPrice + convertedSavePrice).toString()
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