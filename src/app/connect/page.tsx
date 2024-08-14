'use client'
import React, { useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';


const ConnectPage = () => {

    const { login, user } = usePrivy();

    if (user) {
        redirect('/dashboard/wallet')
    }

    return (
        <div className='padding xl:container overflow-x-hidden xl:overflow-visible grid place-items-center h-screen'>
            {/* <DashboardHeader currentPage='' /> */}
            <Button onClick={login}>Connect To Stylus</Button>
        </div>
    )
}

export default ConnectPage