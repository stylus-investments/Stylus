import { getMoralis } from "@/lib/moralis";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    try {

        await getMoralis()

        const body = await req.json()

        console.log(body)

        const providedSignature = req.headers.get('x-signature')

        console.log(providedSignature)
        if (!providedSignature) return NextResponse.json({ msg: "Signature not provided" }, { status: 400 })

        return NextResponse.json({ ok: true }, { status: 200 })

    } catch (error) {
        console.log(error);
        return NextResponse.json({ msg: "Server error", error }, { status: 500 })
    }
}
