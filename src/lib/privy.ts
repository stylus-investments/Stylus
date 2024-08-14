import 'dotenv/config'
import { PrivyClient } from '@privy-io/server-auth';
import { cookies } from 'next/headers';

const privyAppID = process.env.NEXT_PUBLIC_PRIVY_APP_ID as string
const privySecretKey = process.env.PRIVY_SECRET_KEY as string

const privy = new PrivyClient(privyAppID, privySecretKey);

const getUserId = async () => {

    const cookieStore = cookies()

    const authToken = cookieStore.get("privy-token")?.value

    if (authToken) {

        const verifiedClaims = await privy.verifyAuthToken(authToken);

        if (!verifiedClaims) return null
        
        return verifiedClaims.userId

    }

    return null
}

export { privy, getUserId }
