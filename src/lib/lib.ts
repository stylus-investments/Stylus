import { SessionOptions, getIronSession } from "iron-session"
import { cookies } from "next/headers"
import Moralis from 'moralis';
import 'dotenv/config'

export interface SessionData {
    address: string
}

const sessionOptions: SessionOptions = {
    password: process.env.NEXTAUTH_SECRET as string,
    cookieName: 'wallet-session',
    cookieOptions: {
        httpOnly: true,
        secure: false
    }
}

const getSession = async () => {
    const session = await getIronSession<SessionData>(cookies(), sessionOptions)
    if (!session.address) {
        session.address = ''
    }
    return session
}

let isMoralisInitialized = false;

const getMoralis = async () => {
    if (!isMoralisInitialized) {
        await Moralis.start({
            apiKey: process.env.MORALIS_API_KEY
        });
        isMoralisInitialized = true;
    }
}

export { sessionOptions, getSession, getMoralis }