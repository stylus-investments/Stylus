import ConnectWalletFirst from '@/components/dashboard/connect-wallet-first'
import DashboardHeader from '@/components/dashboard/dashboard-header'
import React from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getAuth } from '@/lib/nextAuth'

const ConnectPage = async () => {

    cookies()

    const session = await getAuth()

    if (session?.user) {
        if (session.user.wallet) [
            redirect('/dashboard')
        ]
        redirect('/admin/users')
    }

    return (
        <div className='padding xl:container overflow-x-hidden xl:overflow-visible'>
            <DashboardHeader walletAddress={''} />
            <ConnectWalletFirst />
        </div>
    )
}

export default ConnectPage