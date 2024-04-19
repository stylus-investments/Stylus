import { okayRes, serverErrorRes, unauthorizedRes } from "@/lib/apiResponse";
import { getSession, getMoralis } from "@/lib/lib";
import Moralis from "moralis";

export const GET = async () => {
    try {

        const session = await getSession()
        if (!session.address) return unauthorizedRes()

        await getMoralis()

        const response = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
            chain: "0x2105",
            address: session.address
        })
        
        return okayRes(response.result)

    } catch (error) {
        console.log(error);
        return serverErrorRes(error)
    }
}

export const POST = async () => {
    try {

        return okayRes()
    } catch (error) {
        console.log(error);
        return serverErrorRes(error)
    }
}