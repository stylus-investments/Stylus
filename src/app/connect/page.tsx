import ConnectWalletFirst from '@/components/dashboard/connect-wallet-first'
import DashboardHeader from '@/components/dashboard/dashboard-header'
import React from 'react'
import { caller } from '../_trpc/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

const ConnectPage = async () => {

    cookies()
    const sessionData = await caller.session.get()
    if(sessionData) redirect('/dashboard')

    return (
        <>
            <DashboardHeader walletAddress={''} />
            <ConnectWalletFirst />
        </>
    )
}

export default ConnectPage