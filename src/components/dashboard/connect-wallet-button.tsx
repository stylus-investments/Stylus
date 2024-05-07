'use client'
import React from 'react'
import { Button } from '../ui/button'
import { trpc } from '@/app/_trpc/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const ConnectWalletButton = () => {

    const router = useRouter()

    const session = trpc.session.get.useQuery()
    const createSession = trpc.session.post.useMutation()

    const connectWallet = async () => {

        if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
            /* Metamask is installed*/

            // const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            // if (isMobile) {
            //     // Inform the user to continue to the MetaMask app
            //     const confirmMobile = confirm("Continue to MetaMask app?");

            //     if (confirmMobile) {

            //         window.location.href = `https://metamask.app.link/dapp/${process.env.NEXT_PUBLIC_URL}/`

            //     }
            //     return;
            // }

            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

            if (accounts.length > 0) {
                await createSession.mutateAsync(accounts[0], {
                    onSuccess: async () => {
                        await session.refetch()
                    }
                })
                toast.success("Wallet Connected!")
                return router.push('/dashboard')
            }
            return alert("Failed to logged in")
        } else {
            alert("Please Install Metamask")
        }
    }

    return (
        <>
            <Button onClick={connectWallet} className='hidden md:flex'>
                Connect Wallet
            </Button>
            <Button onClick={connectWallet} className='md:hidden rounded-md'>
                Connect
            </Button>
        </>
    )
}

export default ConnectWalletButton