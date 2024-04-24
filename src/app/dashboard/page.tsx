import AppHeader from '@/components/dashboard/AppHeader'
import React from 'react'
import { caller } from '../_trpc/server';
import Dashboard from '@/components/dashboard/Dashboard';

const AppPage = async () => {


    const sessionData = await caller.session.get()

    return (
        <>
            <AppHeader
                walletAddress={sessionData} />
            <Dashboard
                walletAddress={sessionData}
            />
        </>
    )
}

export default AppPage