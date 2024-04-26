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
        <Button onClick={connectWallet}>
            Connect Wallet
        </Button>
    )
}

export default ConnectWalletButton