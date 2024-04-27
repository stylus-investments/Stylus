import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";

const nextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Phone", type: "number", placeholder: "Phone Number" },
                password: { label: "Password", type: "password", placeholder: "Password" }
            },

            async authorize(credentials) {

                const { data } = await axios.post(`${process.env.NEXTAUTH_URL}/api/auth/login`, credentials)

                if (!data) return null

                return data
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
        signIn: '/admin/auth',
        error: '/admin/error',
        signOut: '/admin/auth'
    },
} satisfies NextAuthOptions

const getAuth = (...args: [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]] | [NextApiRequest, NextApiResponse] | []) => {
    return getServerSession(...args, nextAuthOptions)
}

export { nextAuthOptions, getAuth }