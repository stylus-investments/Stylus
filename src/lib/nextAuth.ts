import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import db from "@/db/db";

declare module "next-auth" {
    interface Session {
        user: {
            wallet: string
        }
    }
}

const nextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Phone", type: "number", placeholder: "Phone Number" },
                password: { label: "Password", type: "password", placeholder: "Password" }
            },

            async authorize(credentials: any) {

                if (credentials.message) {

                    const wallet = JSON.parse(credentials.message).address;

                    const existingUser = await db.user.findUnique({ where: { wallet } })

                    if (!existingUser) {
                        await db.user.create({
                            data: { wallet }
                        })
                    }

                    return {
                        signature: credentials.signature,
                        csrfToken: credentials.csrfToken,
                        callbackUrl: credentials.ballbackUrl,
                        wallet
                    }

                } else {

                    const { data } = await axios.post(`${process.env.NEXTAUTH_URL}/api/auth/login`, credentials)

                    if (!data) return null

                    return data
                }
            },
        })
    ],
    callbacks: {
        async jwt({ token, user }) {

            return { ...token, ...user }
        },
        async session({ session, token }) {

            token.password = undefined

            session.user = token as any

            return session
        }
    },
    pages: {
        signIn: '/auth',
        error: '/error',
    },
} satisfies NextAuthOptions

const getAuth = (...args: [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]] | [NextApiRequest, NextApiResponse] | []) => {
    return getServerSession(...args, nextAuthOptions)
}

export { nextAuthOptions, getAuth }