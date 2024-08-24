import db from "@/db/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcrypt'

export const POST = async (req: NextRequest) => {
    try {

        const { username, password } = await req.json()

        if (!username || !password) return NextResponse.json({ msg: "Missing Inputs" }, { status: 400 })

        //check admin username
        const admin = await db.admin.findUnique({ where: { username } })
        if (!admin) return NextResponse.json(null, { status: 404 })


        //compare password
        const isPasswordCorrect = await bcrypt.compare(password, admin.password)
        if (isPasswordCorrect) return NextResponse.json(admin)

        return NextResponse.json(null, { status: 404 })

    } catch (error) {
        console.log(error);
        return NextResponse.json({ msg: "Server error", error: error })

    } finally {
        await db.$disconnect()
    }
}