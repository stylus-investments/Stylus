import React from 'react'
import { caller } from '../_trpc/server';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import Dashboard from '@/components/dashboard/dashboard';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

const DashboardPage = async () => {

    cookies()
    const sessionData = await caller.session.get()
    if (!sessionData) redirect('/connect')

    const liquidStakingData = await caller.dashboard.getLiquidStaking()

    return (
        <>
            <DashboardHeader
                walletAddress={sessionData} />
            <Dashboard initialData={liquidStakingData} />
        </>
    )
}

export default DashboardPage