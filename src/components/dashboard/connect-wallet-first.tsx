'use client'
import React from 'react'
import ConnectWalletButton from './connect-wallet-button'
import { trpc } from '@/app/_trpc/client'
import DashboardSkeleton from './dashboard-skeleton'
import Image from 'next/image'

const ConnectWalletFirst = () => {

    const session = trpc.session.get.useQuery(undefined, {
        refetchOnMount: false,
        refetchOnReconnect: false
    })

    return (
        <>
            {!session.data ?
                <div>
                    <h1 className='flex flex-col gap-5 py-40 container items-center'>
                        <Image src={'/go.jpeg'} alt='Go Icon' width={100} height={100} className='rounded-full' />
                        <h2 className='text-muted-foreground text-sm'>Connect your wallet first.</h2>
                        <ConnectWalletButton />
                    </h1 >
                </div>
                : <DashboardSkeleton />
            }
        </>
    )

}

export default ConnectWalletFirst