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
    if (session && !session.user.wallet) redirect('/admin/users')

    const liquidStakingData = await caller.dashboard.getLiquidStaking()

    return (
        <div className='padding xl:container overflow-x-hidden xl:overflow-visible'>
            <DashboardHeader
                walletAddress={session.user.wallet} />
            <Dashboard initialData={liquidStakingData} />
        </div>
    )
}

export default DashboardPage