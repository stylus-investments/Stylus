import { okayRes, serverErrorRes, unauthorizedRes } from "@/lib/apiResponse";
import { getMoralis, getSession } from "@/lib/lib";
import Moralis from "moralis";
export const GET = async (req: Request) => {
    try {

        const session = await getSession()
        if (!session.loggedin) return unauthorizedRes()

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