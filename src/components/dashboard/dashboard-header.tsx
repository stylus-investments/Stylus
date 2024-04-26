'use client'
import Image from 'next/image'
import React, { useEffect } from 'react'
import { Button } from '../ui/button'
import { ToggleTheme } from '../ui/toggle-theme'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { trpc } from '@/app/_trpc/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import ConnectWalletButton from './connect-wallet-button'

declare global {
    interface Window {
        ethereum: any; // or unknown
    }
}


const DashboardHeader = ({ walletAddress }: { walletAddress: string }) => {

    const router = useRouter()

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
        <header className='flex fixed top-0 left-0 w-screen h-16 padding items-center backdrop-blur justify-between border-b'>
            <div className='flex items-center'>
                <Image src={'/logo.png'} alt='logo' width={50} height={20} className='w-auto h-auto' />
                <h1 className='text-3xl font-black text-primary'>GrowPoint</h1>
            </div>
            <div className='flex items-center gap-5'>
                <ToggleTheme />
                {session.data ?
                    <div className='flex items-center gap-3'>
                        <Button variant={'outline'} className='cursor-pointer'>
                            {`${session.data.substring(0, 6)}...${session.data.substring(38)}`}
                        </Button>
                        <FontAwesomeIcon icon={faRightFromBracket} width={18} height={18} className='cursor-pointer' onClick={disconnectWallet} />
                    </div>
                    : <ConnectWalletButton />
                }
            </div>
        </header>
    )
}

export default DashboardHeader