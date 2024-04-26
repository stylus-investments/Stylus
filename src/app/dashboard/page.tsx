import React from 'react'
import { caller } from '../_trpc/server';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import Dashboard from '@/components/dashboard/dashboard';
import { redirect } from 'next/navigation';

const DashboardPage = async () => {

    const sessionData = await caller.session.get()
    if (!sessionData) redirect('/connect')

    const dashboardData = await caller.dashboard.get()

    return (
        <>
            <DashboardHeader
                walletAddress={sessionData} />
            <Dashboard initialData={dashboardData} />
        </>
    )
}

export default DashboardPage