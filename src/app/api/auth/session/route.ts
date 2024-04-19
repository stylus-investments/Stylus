import { NextRequest } from "next/server";
import { getSession } from "@/lib/lib";
import { badRequestRes, notFoundRes, okayRes, serverErrorRes, unauthorizedRes } from "@/lib/apiResponse";

export const GET = async (req: NextRequest) => {
    try {

        //get the session
        const session = await getSession()

        //retrurn the session
        return okayRes(session)

    } catch (error) {
        console.log(error);
        return serverErrorRes(error)
    }
}

export const POST = async (req: NextRequest) => {
    try {

        const session = await getSession()

        if (!session.address) {

            //get the session in request body
            const { wallet_address } = await req.json()

            //return 404 if wallet address not found
            if (!wallet_address) return notFoundRes("Wallet Address")

            //modify the session
            session.address = wallet_address

            //save the session
            await session.save()

            //return 200 response
            return okayRes(session)

        }

        return badRequestRes()

    } catch (error) {
        console.log(error);
        return serverErrorRes(error)
    }
}

export const PATCH = async (req: NextRequest) => {
    try {

        const session = await getSession()

        const { wallet_address } = await req.json()
        //return 404 if wallet address not found
        if (!wallet_address) return notFoundRes("Wallet Address")

        //update the session and save
        session.address = wallet_address
        await session.save()

        //return the session
        return okayRes(session)

    } catch (error) {
        console.log(error);
        return serverErrorRes(error)
    }
}

export const DELETE = async (req: NextRequest) => {
    try {

        //retrieve the session
        const session = await getSession()

        if (session.address) {

            //destroy the session
            session.destroy()
            await session.save()
            //return 200 response
            return okayRes({ address: '' })
        }

        return unauthorizedRes()

    } catch (error) {
        console.log(error);
        return serverErrorRes(error)
    }
}