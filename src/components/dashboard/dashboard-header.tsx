'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { ToggleTheme } from '../ui/toggle-theme'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBarsStaggered, faRightFromBracket, faWallet } from '@fortawesome/free-solid-svg-icons';
import { trpc } from '@/app/_trpc/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import ConnectWalletButton from './connect-wallet-button'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '../ui/dropdown-menu'
import Link from 'next/link'

declare global {
    interface Window {
        ethereum: any; // or unknown
    }
}


const DashboardHeader = ({ walletAddress }: { walletAddress: string }) => {

    const router = useRouter()

    const [open, setOpen] = useState(false)

    const session = trpc.session.get.useQuery(undefined, {
        initialData: walletAddress,
        refetchOnMount: false,
        refetchOnReconnect: false
    })
    const updateSession = trpc.session.update.useMutation()
    const deleteSession = trpc.session.delete.useMutation()

    const disconnectWallet = async () => {

        if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
            try {
                //disconnect metamask
                await window.ethereum.request({
                    method: "wallet_revokePermissions",
                    params: [
                        {
                            "eth_accounts": {}
                        }
                    ]
                })

                await deleteSession.mutateAsync(undefined, {
                    onSuccess: async () => {
                        toast.success("Wallet Disconnected");
                        router.push('/');
                        session.refetch()
                    }
                });


            } catch (error) {
                console.log(error);
                alert("Something went wrong")
            }
        }
    }

    const mobileScreen = (
        <nav className='md:hidden flex items-center justify-between w-full'>
            <Link href={'/'} className='flex items-center '>
                <Image src={'/logo.png'} alt='logo' width={48} height={16} className='w-auto h-auto' />
                <h1 className='text-2xl font-black text-primary'>GrowPoint</h1>
            </Link>
            <div className='flex items-center gap-1 sm:gap-2'>
                <ToggleTheme />
                {session.data && <DropdownMenu>
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
                                {`${session.data.substring(0, 6)}...${session.data.substring(38)}`}
                            </span>
                            <DropdownMenuShortcut>
                                <FontAwesomeIcon icon={faWallet} width={16} height={16} />
                            </DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem className='flex items-center gap-2' onClick={disconnectWallet}>
                            <span>Logout</span>
                            <DropdownMenuShortcut>
                                <FontAwesomeIcon icon={faRightFromBracket} width={16} height={16} className='cursor-pointer' />
                            </DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>}

                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetContent side={'right'} className='flex flex-col gap-4 text-muted-foreground pt-10'>
                        <div className='flex items-center'>
                            <Image src={'/logo.png'} alt='logo' width={48} height={16} className='w-auto h-auto' />
                            <h1 className='text-2xl md:text-3xl font-black text-primary'>GrowPoint</h1>
                        </div>
                        <div className='flex items-center gap-3'>
                            <Button variant={'outline'} className='cursor-pointer w-full'>
                                {`${session.data.substring(0, 6)}...${session.data.substring(38)}`}
                            </Button>
                            <Button className='px-3' variant={'outline'}>
                                <FontAwesomeIcon icon={faRightFromBracket} width={16} height={16} className='cursor-pointer' onClick={disconnectWallet} />
                            </Button>
                        </div>

                    </SheetContent>
                </Sheet>
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
                {session.data ?
                    <>
                        <div className='md:flex items-center gap-3 hidden'>
                            <Button variant={'ghost'} className='cursor-pointer'>
                                {`${session.data.substring(0, 6)}...${session.data.substring(38)}`}
                            </Button>
                            <Button className='px-3' variant={'ghost'}>
                                <FontAwesomeIcon icon={faRightFromBracket} width={16} height={16} className='cursor-pointer' onClick={disconnectWallet} />
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


    useEffect(() => {
        const handleAccountsChanged = async (accounts: string[]) => {
            if (accounts.length > 0) {
                await updateSession.mutateAsync(accounts[0], {
                    onSuccess: async () => {
                        await session.refetch();
                        // await dashboard.refetch()
                        toast.success("Wallet Changed!");
                    }
                });
            }
        };

        if (typeof window !== "undefined" && typeof window.ethereum !== "undefined" && session.data) {
            window.ethereum.on("accountsChanged", handleAccountsChanged);
        }

        return () => {
            // Cleanup function to remove the event listener when component unmounts
            if (typeof window !== "undefined" && typeof window.ethereum !== "undefined" && session.data) {
                window.ethereum.off("accountsChanged", handleAccountsChanged);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session.data])

    return (
        <header className='flex fixed top-0 left-0 w-screen h-16 padding items-center backdrop-blur justify-between border-b z-20'>
            {largeScreen}
            {mobileScreen}
        </header>
    )
}

export default DashboardHeader