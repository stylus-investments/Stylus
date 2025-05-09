import { caller } from '@/app/_trpc/server'
import DashboardHeader from '@/components/dashboard/dashboard-header'
import DashboardLinksFooter from '@/components/dashboard/dashboard-links-footer'
import ProfileForm from '@/components/dashboard/profile/profile-form'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'

const Page = async () => {

    cookies()
    try {
        const initialInfo = await caller.user.getCurrentUserInfo()

        return (
            <div>
                <DashboardHeader currentPage='profile' />
                <DashboardLinksFooter currentPage='profile' />
                <ProfileForm profileInfo={initialInfo} />
            </div>
        )

    } catch (error) {
        console.log(error);
        redirect('/dashboard/wallet')
    }
}

export default Page