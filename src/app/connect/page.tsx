import ConnectWalletFirst from '@/components/dashboard/connect-wallet-first'
import DashboardHeader from '@/components/dashboard/dashboard-header'
import React from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getAuth } from '@/lib/nextAuth'

const ConnectPage = async () => {

    cookies()
    const session = await getAuth()

    if (session?.user) redirect('/dashboard')

    return (
        <>
            <DashboardHeader walletAddress={''} />
            <ConnectWalletFirst />
        </>
    )
}

export default ConnectPage