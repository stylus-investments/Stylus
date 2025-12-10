'use client'
import React, { useEffect } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { trpc } from '../_trpc/client';
import { useRouter } from 'next-nprogress-bar';

const ConnectPage = () => {

    const router = useRouter()

    const { refetch } = trpc.user.getCurrentUserInfo.useQuery(undefined, {
        enabled: false
    })

    const { login, user, ready, authenticated, createWallet } = usePrivy();

    const wallet = useWallets().wallets.find(item => item.walletClientType === 'privy')

    useEffect(() => {
        if (ready && user?.hasAcceptedTerms && authenticated && user.wallet?.address && wallet?.address) {
            // Refetch user info once authenticated and wallet address is available
            refetch().then(() => {
                // After refetching, redirect to the dashboard
                router.push('/dashboard/wallet')
            });
        }

        if (ready && user?.hasAcceptedTerms && authenticated && user.wallet?.address && !wallet?.address) {
            createWallet()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, ready, user?.wallet?.address, user?.hasAcceptedTerms, wallet?.address, authenticated]);


    if (ready && authenticated && user?.wallet?.address) {
        return (
            <div className='padding xl:container overflow-x-hidden xl:overflow-visible grid place-items-center h-screen'>
                <LoaderCircle size={40} className='animate-spin' />
            </div>
        )
    }

    return (
        <div className='padding xl:container overflow-x-hidden xl:overflow-visible grid place-items-center h-screen'>
            <Button onClick={login}>Connect To Tych</Button>
        </div>
    )
}

export default ConnectPage