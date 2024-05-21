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
                <Image src={'/logo.png'} alt='logo' width={40} height={16} className='h-auto' />
                <h1 className='text-2xl font-black text-primary'>GrowPoint</h1>
            </Link>
            <div className='flex items-center gap-1 sm:gap-2'>
                <ToggleTheme />
                {walletAddress &&
                    <DropdownMenu>
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
                                    redirect: false,
                                })}
                            >
                                <span>Logout</span>
                                <DropdownMenuShortcut>
                                    <FontAwesomeIcon icon={faRightFromBracket} width={16} height={16} className='cursor-pointer' />
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                }
            </div>
        </nav>
    )

    const largeScreen = (
        <nav className='hidden md:flex items-center justify-between w-full'>
            <Link href={'/'} className='flex items-center'>
                <Image src={'/logo.png'} alt='logo' width={40} height={16} className='h-auto' />
                <h1 className='text-2xl font-black text-primary'>GrowPoint</h1>
            </Link>
            <div className='flex items-center gap-2'>
                <ToggleTheme />
                {walletAddress ?
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant={'outline'}>
                                {`${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className='flex items-center gap-2'
                                onClick={() => signOut({
                                    redirect: false,
                                })}
                            >
                                <span>Logout</span>
                                <DropdownMenuShortcut>
                                    <FontAwesomeIcon icon={faRightFromBracket} width={16} height={16} className='cursor-pointer' />
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    :
                    <ConnectWalletButton />
                }
            </div>
        </nav>
    )

    return (
        <header className='flex top-0 left-0 w-screen padding fixed md:sticky md:p-0 md:w-full h-16 backdrop-blur padding items-center z-50 justify-between border-b'>
            {largeScreen}
            {mobileScreen}
        </header>
    )
}

export default DashboardHeader