'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { ToggleTheme } from '../ui/toggle-theme'
import useWalletStore from '@/states/app/walletStore'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuShortcut } from '../ui/dropdown-menu'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRightToBracket, faChevronDown, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import useSessionStore from '@/states/app/sessionStore'

const AppHeader = () => {

    const [isListenerActivated, setIsListenerActivated] = useState(false)

    const { connectWallet, walletListener, disconnectWallet } = useWalletStore()
    const { session } = useSessionStore()

    useEffect(() => {
        if (!isListenerActivated && session.address) {
            walletListener(session.address)
            setIsListenerActivated(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session.address])

    return (
        <header className='flex fixed top-0 left-0 w-screen h-16 padding items-center backdrop-blur justify-between border-b'>
            <div className='flex items-center gap-4'>
                <Image src={'/logo.png'} alt='logo' width={50} height={20} className='w-auto h-auto' />
                <h1 className='text-3xl font-black text-primary'>GrowPoint</h1>
            </div>
            <div className='flex items-center gap-5'>
                <ToggleTheme />
                {session.address ?
                    <div className='flex items-center gap-3'>
                        <Button variant={'outline'} className='cursor-pointer'>
                            {`${session.address.substring(0, 6)}...${session.address.substring(38)}`}
                        </Button>
                        <FontAwesomeIcon icon={faRightFromBracket} width={18} height={18} className='cursor-pointer' onClick={disconnectWallet} />
                    </div>
                    : <Button onClick={connectWallet}>
                        Connect Wallet
                    </Button>}
            </div>
        </header>
    )
}

export default AppHeader