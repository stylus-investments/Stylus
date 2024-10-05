'use client'
import React, { useEffect } from 'react'
import { Button } from '../ui/button'
import { ToggleTheme } from '../ui/toggle-theme'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBarsStaggered, faWallet } from '@fortawesome/free-solid-svg-icons';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '../ui/dropdown-menu'
import DashboardLinksHeader from './dashboard-links-header'
import { LogOut } from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'
import { toast } from 'sonner'
import UserProfile from './user-profile'
import { Skeleton } from '../ui/skeleton'
import { redirect } from 'next/navigation'
import Notifications from './notifications'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select'
import { availableCurrencies } from '@/constant/availableCurrency'
import useBalanceStore from '@/state/balanceStore'


const DashboardHeader = ({ currentPage }: { currentPage: string }) => {

    const { user, logout, authenticated, ready } = usePrivy()

    const { currency, setCurrency } = useBalanceStore()

    useEffect(() => {

        if (ready && !authenticated) {
            redirect('/connect')
        }

    }, [user, ready, authenticated])

    const mobileScreen = (
        <nav className='lg:hidden flex items-center justify-between w-full'>
            <div className='flex items-center'>
                <Notifications />
                <UserProfile />

            </div>
            <div className='flex items-center gap-1 sm:gap-2'>
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
                <ToggleTheme />
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
                            <span onClick={() => {
                                navigator.clipboard.writeText(user?.wallet?.address || '')
                                toast.success("Wallet address copied.")
                            }}>
                                {`${user?.wallet?.address.substring(0, 6)}...${user?.wallet?.address.substring(38)}`}
                            </span>
                            <DropdownMenuShortcut>
                                <FontAwesomeIcon icon={faWallet} width={16} height={16} />
                            </DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem className='flex items-center gap-2' onClick={() => {
                            logout()
                            redirect('/connect')
                        }}>
                            <span>
                                Logout
                            </span>
                            <DropdownMenuShortcut>
                                <LogOut size={16} />
                            </DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    )

    const largeScreen = (
        <nav className='hidden lg:flex items-center justify-between w-full'>

            <div className='flex items-center gap-1'>
                <Notifications />
                <UserProfile />
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
            </div>
            <div className='flex items-center gap-5 justify-end w-full'>
                <DashboardLinksHeader currentPage={currentPage} />
                <ToggleTheme />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        {user?.wallet?.address ?
                            <Button>
                                {`${user?.wallet?.address.substring(0, 6)}...${user?.wallet?.address.substring(38)}`}
                            </Button>
                            :
                            <Skeleton className='w-32 h-9' />}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className='flex items-center gap-2' onClick={() => {
                            logout()
                            redirect('/connect')
                        }}>
                            <span>
                                Logout
                            </span>
                            <DropdownMenuShortcut>
                                <LogOut size={16} />
                            </DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

            </div>
        </nav >
    )
    return (
        <header className='flex top-0 left-0 w-screen padding fixed md:w-full h-16 backdrop-blur padding items-center z-50 justify-between border-b'>
            {largeScreen}
            {mobileScreen}
        </header>
    )
}

export default DashboardHeader