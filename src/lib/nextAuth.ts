import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";

declare module "next-auth" {
    interface Session {
        user: {
            username: string
            root_admin: boolean
            name: string
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

                const { data } = await axios.post(`${process.env.NEXTAUTH_URL}/api/auth/login`, credentials)

                if (!data) return null

                return data
            }
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
        signOut: '/auth',
        error: '/error',
    },
} satisfies NextAuthOptions

const getAuth = (...args: [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]] | [NextApiRequest, NextApiResponse] | []) => {
    return getServerSession(...args, nextAuthOptions)
}

export { nextAuthOptions, getAuth }