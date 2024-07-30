'use client'
import Image from 'next/image'
import React from 'react'
import { Button } from '../ui/button'
import { ToggleTheme } from '../ui/toggle-theme'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBarsStaggered, faRightFromBracket, faWallet } from '@fortawesome/free-solid-svg-icons';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '../ui/dropdown-menu'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import useProfileStore from '@/state/profileStore'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import DashboardLinksHeader from './dashboard-links-header'
import ProfilePage from './profile-page'
import { CircleUserRound } from 'lucide-react'
import useBalanceStore from '@/state/balanceStore'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select'
import { availableCurrencies } from '@/constant/availableCurrency'


const DashboardHeader = ({ currentPage }: { currentPage: string }) => {

    const session = useSession()

    const { open, setOpen } = useProfileStore()

    const { currency, setCurrency } = useBalanceStore()

    const mobileScreen = (
        <nav className='lg:hidden flex items-center justify-between w-full'>
            {session.data?.user.wallet ? <div className='flex items-center gap-3'>
                <CircleUserRound size={25} className='cursor-pointer' onClick={() => setOpen(true)} />
                <Select value={currency} onValueChange={(value) => setCurrency(value)}>
                    <SelectTrigger className='w-20'>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Currency</SelectLabel>
                            {availableCurrencies.map((obj, i) => (
                                <SelectItem value={obj.currency} key={i} >
                                    {obj.currency}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div> :
                <Link href={'/'} className='flex items-end'>
                    <Image src={'/logo.png'} alt='Logo' width={35} height={35} />
                    <h1 className='font-[1000] text-xl'>SAVERN</h1>
                </Link>
            }
            <div className='flex items-center gap-1 sm:gap-2'>
                <ToggleTheme />
                {session.data?.user.wallet &&
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
                                    {`${session.data.user.wallet.substring(0, 6)}...${session.data.user.wallet.substring(38)}`}
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
        <nav className='hidden lg:flex items-center justify-between w-full'>

            {session.data?.user.wallet ? <div className='flex items-center gap-4'>

                <Select value={currency} onValueChange={(value) => setCurrency(value)}>
                    <SelectTrigger className='w-20'>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Currency</SelectLabel>
                            {availableCurrencies.map((obj, i) => (
                                <SelectItem value={obj.currency} key={i} >
                                    {obj.currency}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <div onClick={() => setOpen(true)} className='flex items-center gap-1 cursor-pointer'>
                    <FontAwesomeIcon icon={faUser} width={16} height={16} />
                    <span>Profile</span>
                </div>
            </div> :
                <Link href={'/'} className='flex items-end'>
                    <Image src={'/logo.png'} alt='Logo' width={35} height={35} />
                    <h1 className='font-[1000] text-xl'>SAVERN</h1>
                </Link>
            }
            <div className='flex items-center gap-5 justify-end w-full'>
                <DashboardLinksHeader currentPage={currentPage} />
                <ToggleTheme />
                {session.data?.user.wallet ?
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant={'outline'}>
                                {`${session.data.user.wallet.substring(0, 6)}...${session.data.user.wallet.substring(38)}`}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className='flex items-center gap-2'
                                onClick={() => signOut()}
                            >
                                <span>Logout</span>
                                <DropdownMenuShortcut>
                                    <FontAwesomeIcon icon={faRightFromBracket} width={16} height={16} className='cursor-pointer' />
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    :
                    null
                }
            </div>
        </nav >
    )
    return (
        <header className='flex top-0 left-0 w-screen padding fixed md:w-full h-16 backdrop-blur padding items-center z-50 justify-between border-b'>
            {largeScreen}
            {mobileScreen}
            {open && <ProfilePage />}
        </header>
    )
}

export default DashboardHeader