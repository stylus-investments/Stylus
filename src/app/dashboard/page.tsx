import React from 'react'
import { caller } from '../_trpc/server';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import Dashboard from '@/components/dashboard/dashboard';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getAuth } from '@/lib/nextAuth';

const DashboardPage = async () => {

    cookies()
    const session = await getAuth()
    if (!session) redirect('/connect')

    const liquidStakingData = await caller.dashboard.getLiquidStaking()

    return (
        <>
            <DashboardHeader
                walletAddress={session.user.wallet} />
            <Dashboard initialData={liquidStakingData} />
        </>
    )
}

export default DashboardPage