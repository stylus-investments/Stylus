'use client'
import Image from 'next/image'
import React from 'react'
import { Button } from '../ui/button'
import { ToggleTheme } from '../ui/toggle-theme'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBarsStaggered, faRightFromBracket, faWallet } from '@fortawesome/free-solid-svg-icons';
import ConnectWalletButton from './connect-wallet-button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '../ui/dropdown-menu'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

const DashboardHeader = ({ walletAddress }: { walletAddress: string }) => {

    const mobileScreen = (
        <nav className='md:hidden flex items-center justify-between w-full'>
            <Link href={'/'} className='flex items-center '>
                <Image src={'/logo.png'} alt='logo' width={48} height={16} className='w-auto h-auto' />
                <h1 className='text-2xl font-black text-primary'>GrowPoint</h1>
            </Link>
            <div className='flex items-center gap-1 sm:gap-2'>
                <ToggleTheme />
                {walletAddress && <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className='px-3 text-foreground' variant={'ghost'}>
                            <FontAwesomeIcon icon={faBarsStaggered} width={16} height={16} className='cursor-pointer' />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className='flex items-center gap-2'>
                            <span>
                                {`${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`}
                            </span>
                            <DropdownMenuShortcut>
                                <FontAwesomeIcon icon={faWallet} width={16} height={16} />
                            </DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem className='flex items-center gap-2'
                            onClick={() => signOut({
                                redirect: true,
                                callbackUrl: '/connect'
                            })}
                        >
                            <span>Logout</span>
                            <DropdownMenuShortcut>
                                <FontAwesomeIcon icon={faRightFromBracket} width={16} height={16} className='cursor-pointer' />
                            </DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>}
            </div>
        </nav>
    )

    const largeScreen = (
        <nav className='hidden md:flex items-center justify-between w-full'>
            <Link href={'/'} className='flex items-center'>
                <Image src={'/logo.png'} alt='logo' width={48} height={16} className='w-auto h-auto' />
                <h1 className='text-2xl md:text-3xl font-black text-primary'>GrowPoint</h1>
            </Link>
            <div className='flex items-center gap-2'>
                <ToggleTheme />
                {walletAddress ?
                    <>
                        <div className='md:flex items-center gap-3 hidden'>
                            <Button variant={'ghost'} className='cursor-pointer'>
                                {`${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`}
                            </Button>
                            <Button className='px-3' variant={'ghost'}>
                                <FontAwesomeIcon icon={faRightFromBracket} width={16} height={16} className='cursor-pointer' onClick={() => signOut({
                                    redirect: true,
                                    callbackUrl: '/connect'
                                })} />
                            </Button>
                        </div>
                    </>
                    :
                    <div className='hidden md:flex'>
                        <ConnectWalletButton />
                    </div>
                }
            </div>
        </nav>
    )

    return (
        <header className='flex fixed top-0 left-0 w-screen h-16 padding items-center backdrop-blur justify-between border-b z-20'>
            {largeScreen}
            {mobileScreen}
        </header>
    )
}

export default DashboardHeader