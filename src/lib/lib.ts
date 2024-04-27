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
        secure: process.env.NODE_ENV === "production" ? true : false
    }
}

const getSession = async () => {
    const session = await getIronSession<SessionData>(cookies(), sessionOptions)
    if (!session.address) {
        session.address = ''
    }
    return session
}


export { sessionOptions, getSession }