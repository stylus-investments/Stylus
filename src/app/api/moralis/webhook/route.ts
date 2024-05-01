import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    try {

        return NextResponse.json({ ok: true }, { status: 200 })

    } catch (error) {
        console.log(error);

    }
}