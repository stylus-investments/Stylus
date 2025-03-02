import { EARN_ADDRESS, SAVE, SBTC, SPHP, USDC_ADDRESS } from "@/lib/token_address";

const getTokenName = (tokenAddress: string) => {
    switch (tokenAddress) {
        case SBTC:
            return 'sBTC'
        case SPHP:
            return 'sPHP'
        case SAVE:
            return 'sAVE'
        case EARN_ADDRESS:
            return 'EARN'
        case USDC_ADDRESS:
            return 'USDC'
        default:
            return ''
    }
}

export {getTokenName}