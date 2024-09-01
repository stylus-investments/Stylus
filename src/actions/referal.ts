'use server'

import db from "@/db/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const setReferal = async (referalCode: string) => {

    const inviter = await db.referral_info.findUnique({
        where: { referral_code: referalCode },
        select: { referral_code: true }
    });

    const cookieValue = inviter ? inviter.referral_code : process.env.VEGETA as string;

    cookies().set("inviter", cookieValue, {
        secure: true,
        httpOnly: true,
        sameSite: "strict"
    })

    redirect('/connect')
}