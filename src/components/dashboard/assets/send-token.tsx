'use client'
import { caller } from '@/app/_trpc/server'
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ABI } from '@/constant/abi'
import { BASE_CHAIN_ID } from '@/lib/token_address'
import { useWallets } from '@privy-io/react-auth'
import { ethers } from 'ethers'
import { ArrowUp, LoaderCircle } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'

const SentToken = ({ tokenData }: {
    tokenData: Awaited<ReturnType<typeof caller['dashboard']['getAssetData']>>

}) => {

    const { wallets } = useWallets()
    const wallet = wallets[0]
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const [formData, setFormData] = useState({
        recipientAddress: '',
        amount: ""
    })

    const sendToken = async (e: React.FormEvent) => {

        e.preventDefault()
        try {

            const { amount, recipientAddress } = formData

            setLoading(true)

            // Check if amount is greater than 0
            if (Number(amount) <= 0) {
                setLoading(false)
                return toast.error("Amount must be greater than 0");
            }

            if (!ethers.isAddress(recipientAddress)) {
                setLoading(false)
                return toast.error("Invalid wallet address");
            }

            await wallet.switchChain(BASE_CHAIN_ID)
            const provider = await wallet.getEthersProvider()
            const signer = provider.getSigner() as any
            const tokenContract = new ethers.Contract(tokenData.address, ABI, signer);
            const decimals = await tokenContract.decimals()
            // Get the user's balance
            const userAddress = wallet.address // Get user's wallet address
            const userBalance = await tokenContract.balanceOf(userAddress);

            // Convert the user's balance to a readable format
            const readableBalance = ethers.formatUnits(userBalance, decimals);

            const convertedAmount = ethers.parseUnits(amount, decimals)
            const transactionResponse = await tokenContract.transfer(recipientAddress, convertedAmount)
            setLoading(false)
            setFormData({ recipientAddress: "", amount: "" })
            setOpen(false)
            toast.success("Success! token has been sent.")

        } catch (error) {
            setLoading(false)
            toast.error("Something went wrong.")
            console.error('Error sending token:', error);
        }
    };

    return (
        <div>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogTrigger asChild>
                    <div className='flex flex-col gap-1.5 items-center'>
                        <Button className='w-11 h-11 p-0 rounded-full' variant={'secondary'}>
                            <ArrowUp size={20} />
                        </Button>
                        <Label className='text-sm font-normal'>Send</Label>
                    </div>
                </AlertDialogTrigger>
                <AlertDialogContent className='max-w-96'>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Transfer Token</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to transfer {tokenData.name} to the specified recipient. Please note that you will need ETH in your wallet to cover the transaction fees (gas). Review the details carefully before confirming.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <form onSubmit={sendToken} className='flex flex-col gap-5'>
                        <div className='flex flex-col gap-2'>
                            <Label>Wallet Address</Label>
                            <Input placeholder='0x...' value={formData.recipientAddress} onChange={(e) => setFormData(prev => ({ ...prev, recipientAddress: e.target.value }))} />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label>Amount</Label>
                            <Input placeholder='Enter amount' value={formData.amount} onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))} />
                        </div>
                        <AlertDialogFooter className='flex items-center flex-row gap-5'>
                            <AlertDialogCancel className='w-full'>Close</AlertDialogCancel>
                            <Button className='w-full' disabled={loading}>{loading ? <LoaderCircle size={18} className='animate-spin' /> : "Send"}</Button>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default SentToken