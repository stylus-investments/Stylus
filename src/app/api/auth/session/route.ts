import { NextRequest } from "next/server";
import { getSession } from "@/lib/lib";
import { notFoundRes, okayRes, serverErrorRes } from "@/lib/apiResponse";

export const GET = async (req: NextRequest) => {
    try {

        //get the session
        const session = await getSession()

        //if session does not found return 401
        if (!session.loggedin) return okayRes({ address: '', loggedin: false })

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
        if (session.loggedin) return okayRes()

        //get the session in request body
        const { wallet_address } = await req.json()

        //return 404 if wallet address not found
        if (!wallet_address) return notFoundRes("Wallet Address")

        //modify the session
        session.address = wallet_address
        session.loggedin = true

        //save the session
        await session.save()

        //return 200 response
        return okayRes(session)

    } catch (error) {
        console.log(error);
        return serverErrorRes(error)
    }
}

export const PATCH = async (req: NextRequest) => {
    try {
        const session = await getSession()
        if (!session.loggedin) return okayRes({ address: '', loggedin: false })
        const { wallet_address } = await req.json()
        //return 404 if wallet address not found
        if (!wallet_address) return notFoundRes("Wallet Address")

        //update the session and save
        session.address = wallet_address
        await session.save()
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
        //destroy the session
        session.destroy()
        await session.save()
        //return 200 response
        return okayRes({ address: '', loggedin: false })

    } catch (error) {
        console.log(error);
        return serverErrorRes(error)
    }
}