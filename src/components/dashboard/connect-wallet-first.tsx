'use client'
import React, { useEffect } from 'react'
import ConnectWalletButton from './connect-wallet-button'
import DashboardSkeleton from './dashboard-skeleton'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const ConnectWalletFirst = () => {

    const session = useSession()

    useEffect(() => {

        if (session.status === 'authenticated') {
            window.location.href = '/dashboard'
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session])

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