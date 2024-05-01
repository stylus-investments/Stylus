'use client'
import React from 'react'
import ConnectWalletButton from './connect-wallet-button'
import { trpc } from '@/app/_trpc/client'
import DashboardSkeleton from './dashboard-skeleton'

const ConnectWalletFirst = () => {

    const session = trpc.session.get.useQuery(undefined, {
        refetchOnMount: false,
        refetchOnReconnect: false
    })

    return (
        <>
            {!session.data ?
                <div>
                    <h1 className='text-2xl font-black flex flex-col gap-5 py-40 w-96 container'>
                        Connect Your Wallet First.
                        <ConnectWalletButton />
                    </h1 >
                </div>
                : <DashboardSkeleton />
            }
        </>
    )

}

export default ConnectWalletFirst