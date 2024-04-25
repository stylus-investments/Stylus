import React from 'react'
import { caller } from '../_trpc/server';
import { cookies } from 'next/headers'
import DashboardHeader from '@/components/dashboard/dashboard-header';
import Dashboard from '@/components/dashboard/dashboard';


const AppPage = async () => {

    cookies()
    
    const sessionData = await caller.session.get()

    return (
        <>
            <DashboardHeader
                walletAddress={sessionData} />
            <Dashboard
                walletAddress={sessionData}
            />
        </>
    )
}

export default AppPage