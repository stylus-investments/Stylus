'use client'
import React from 'react'
import { Button } from '../ui/button'
import { ToggleTheme } from '../ui/toggle-theme'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBarsStaggered, faWallet } from '@fortawesome/free-solid-svg-icons';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import DashboardLinksHeader from './dashboard-links-header'
import { CircleUserRound, Download, LogOut } from 'lucide-react'
import useBalanceStore from '@/state/balanceStore'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select'
import { availableCurrencies } from '@/constant/availableCurrency'
import { usePrivy } from '@privy-io/react-auth'
import { toast } from 'sonner'


const DashboardHeader = ({ currentPage }: { currentPage: string }) => {

    const { user, logout, exportWallet } = usePrivy()


    const { currency, setCurrency } = useBalanceStore()

    const mobileScreen = (
        <nav className='lg:hidden flex items-center justify-between w-full'>
            <div className='flex items-center gap-3'>
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

            <div className='flex items-center gap-1 sm:gap-2'>
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
                        {user?.wallet?.walletClientType === 'privy' && <DropdownMenuItem className='flex items-center gap-2' onClick={exportWallet}>
                            <span>
                                Export Wallet
                            </span>
                            <DropdownMenuShortcut>
                                <Download size={16} />
                            </DropdownMenuShortcut>
                        </DropdownMenuItem>}
                        <DropdownMenuItem className='flex items-center gap-2' onClick={logout}>
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

            <div className='flex items-center gap-4'>

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
                        <Button>
                            {`${user?.wallet?.address.substring(0, 6)}...${user?.wallet?.address.substring(38)}`}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {user?.wallet?.walletClientType === 'privy' && <DropdownMenuItem className='flex items-center gap-2' onClick={exportWallet}>
                            <span>
                                Export Wallet
                            </span>
                            <DropdownMenuShortcut>
                                <Download size={16} />
                            </DropdownMenuShortcut>
                        </DropdownMenuItem>}
                        <DropdownMenuItem className='flex items-center gap-2' onClick={logout}>
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