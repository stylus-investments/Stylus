'use client'
import React, { useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { trpc } from '../_trpc/client';

const ConnectPage = () => {

    const {  refetch } = trpc.user.getCurrentUserInfo.useQuery(undefined, {
        enabled: false
    })

    const { login, user, ready, authenticated } = usePrivy();

    useEffect(() => {
        if (ready && user?.hasAcceptedTerms && authenticated && user.wallet?.address) {
            // Refetch user info once authenticated and wallet address is available
            refetch().then(() => {
                // After refetching, redirect to the dashboard
                window.location.href = '/dashboard/wallet';
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, ready, user?.wallet?.address, user?.hasAcceptedTerms]);

    if (ready && authenticated && user?.wallet?.address) {
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