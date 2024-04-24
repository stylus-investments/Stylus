import db from "@/db/db";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    try {

        const { username, password } = await req.json()

        const admin = await db.admin.findFirst({
            where: { username, password }
        })

        if (!admin) return null

        return NextResponse.json(admin, { status: 200 })

    } catch (error) {
        console.log(error);
        return NextResponse.json({ msg: "Server error", error }, { status: 500 })
    } finally {
        await db.$disconnect()
    }
}