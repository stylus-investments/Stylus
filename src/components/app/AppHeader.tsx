'use client'
import Image from 'next/image'
import React, { useEffect } from 'react'
import { Button } from '../ui/button'
import { ToggleTheme } from '../ui/toggle-theme'
import useWalletStore from '@/states/app/walletStore'
import { SessionData } from '@/lib/lib'

interface Props {
    session: SessionData
}

const AppHeader = ({ session }: Props) => {

    const { connectWallet, walletListener } = useWalletStore()

    useEffect(() => {

        if (session.loggedin) walletListener()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session.loggedin])

    return (
        <div className='flex fixed top-0 left-0 w-screen h-20 padding items-center justify-between'>
            <div className='flex items-center gap-4'>
                <Image src={'/logo.png'} alt='logo' width={50} height={20} className='w-auto h-auto' />
                <h1 className='text-3xl font-black'>GrowPoint</h1>
            </div>
            <div className='flex items-center gap-5'>
                <ToggleTheme />
                {session.address ?
                    <Button>
                        {`${session.address.substring(0, 6)}...${session.address.substring(38)}`}
                    </Button> : <Button onClick={connectWallet}>
                        Connect Wallet
                    </Button>}
            </div>
        </div>
    )
}

export default AppHeader