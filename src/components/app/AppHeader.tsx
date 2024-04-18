'use client'
import Image from 'next/image'
import React, { useEffect } from 'react'
import { Button } from '../ui/button'
import { ToggleTheme } from '../ui/toggle-theme'
import useWalletStore from '@/states/app/walletStore'
import { SessionData } from '@/lib/lib'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuShortcut } from '../ui/dropdown-menu'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRightToBracket, faCaretDown, faChevronDown } from '@fortawesome/free-solid-svg-icons';

interface Props {
    session: SessionData
}

const AppHeader = ({ session }: Props) => {

    const { connectWallet, walletListener, disconnectWallet } = useWalletStore()

    useEffect(() => {

        if (session.loggedin) walletListener()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session.loggedin])

    return (
        <header className='flex fixed top-0 left-0 w-screen h-20 padding items-center justify-between border-b'>
            <div className='flex items-center gap-4'>
                <Image src={'/logo.png'} alt='logo' width={50} height={20} className='w-auto h-auto' />
                <h1 className='text-3xl font-black'>GrowPoint</h1>
            </div>
            <div className='flex items-center gap-5'>
                <ToggleTheme />
                {session.address ?
                    <>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className='flex items-center gap-2'>
                                    {`${session.address.substring(0, 6)}...${session.address.substring(38)}`}
                                    <FontAwesomeIcon icon={faChevronDown} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-40">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className='cursor-pointer' onClick={disconnectWallet}>
                                    Log out
                                    <DropdownMenuShortcut>
                                        <FontAwesomeIcon icon={faArrowRightToBracket} />
                                    </DropdownMenuShortcut>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                    : <Button onClick={connectWallet}>
                        Connect Wallet
                    </Button>}
            </div>
        </header>
    )
}

export default AppHeader