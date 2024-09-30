'use client'
import React from 'react'
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';

const ConnectPage = () => {

    const { login, user, ready, authenticated } = usePrivy();

    if (ready && user?.hasAcceptedTerms && authenticated && user.wallet?.address) {
        window.location.href = '/dashboard/wallet'

        return (
            <div className='padding xl:container overflow-x-hidden xl:overflow-visible grid place-items-center h-screen'>
                <LoaderCircle size={40} className='animate-spin' />
            </div>
        )
    }

    return (
        <div className='padding xl:container overflow-x-hidden xl:overflow-visible grid place-items-center h-screen'>
            <Button onClick={login}>Connect To Stylus</Button>
        </div>
    )
}

export default ConnectPage