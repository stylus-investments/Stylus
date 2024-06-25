/* eslint-disable react/no-unescaped-entities */
'use client'
import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { ABI } from '@/lib/abi'
import { Config, useWriteContract } from 'wagmi'
import { CircleCheck, LoaderCircle } from 'lucide-react'
import { WriteContractMutateAsync } from 'wagmi/query'

const TransferSave = () => {

    const [open, setOpen] = useState(false)
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const { writeContractAsync, isPending } = useWriteContract()
    const [success, setSuccess] = useState(false)

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button className='w-full h-9'>
                    Transfer
                </Button>
            </AlertDialogTrigger>
            {success ?
                <AlertDialogContent className='flex flex-col gap-5 items-center w-full max-w-96'>
                    <CircleCheck size={100} />
                    <h1 className='text-xl font-bold text-center'>Token Transfer Successful</h1>
                    <p className='text-muted-foreground text-sm'>You may now close this message.</p>
                    <Button onClick={() => {
                        setOpen(false)
                        setTimeout(() => {
                            setAcceptedTerms(false)
                            setSuccess(false)
                        }, 1000)
                    }} variant={'secondary'} className='w-full'>Close</Button>
                </AlertDialogContent> :
                <AlertDialogContent className='w-full max-w-96'>
                    {acceptedTerms ?
                        <TransferSaveForm
                            setSuccess={setSuccess}
                            writeContractAsync={writeContractAsync}
                            isPending={isPending}
                            setAcceptedTerms={setAcceptedTerms}
                            setOpen={setOpen} />
                        : <TransferDisClosure
                            setAcceptedTerms={setAcceptedTerms}
                            setOpen={setOpen} />}
                </AlertDialogContent>}
        </AlertDialog>
    )
}

const TransferDisClosure = ({ setAcceptedTerms, setOpen }: {
    setAcceptedTerms: React.Dispatch<React.SetStateAction<boolean>>
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {

    const [checkboxTerms, setCheckboxTerms] = useState({
        one: false,
        two: false,
        three: false
    })

    return (
        <form className='flex flex-col gap-4' onSubmit={(e) => {
            e.preventDefault()
            setAcceptedTerms(true)
        }}>
            <h1 className='text-2xl pb-3'>Transfer Save</h1>
            <div className='flex gap-5 items-center'>
                <Checkbox id='one' required checked={checkboxTerms.one} onCheckedChange={() => setCheckboxTerms(prev => ({ ...prev, one: !prev.one }))} />
                <Label htmlFor='one' className='cursor-pointer text-muted-foreground text-xs font-normal'>
                    I acknowledge that I am transferring SAVE tokens from my wallet to another user's wallet.
                </Label>
            </div>
            <div className='flex gap-5 items-center'>
                <Checkbox id='two' required checked={checkboxTerms.two} onCheckedChange={() => setCheckboxTerms(prev => ({ ...prev, two: !prev.two }))} />
                <Label htmlFor='two' className='cursor-pointer text-muted-foreground text-xs font-normal'>
                    I confirm that I have verified the recipient's address as a valid ERC-20 wallet address on the Base Network.
                </Label>
            </div>
            <div className='flex gap-5 items-center'>
                <Checkbox id='three' required checked={checkboxTerms.three} onCheckedChange={() => setCheckboxTerms(prev => ({ ...prev, three: !prev.three }))} />
                <Label htmlFor='three' className='cursor-pointer text-muted-foreground text-xs font-normal'>
                    I understand that if the transferred SAVE tokens are not returned before the next epoch snapshot, my balance may fall below the required minimum. Consequently, I will be ineligible for the potential rewards of this epoch and will not receive them.
                </Label>
            </div>
            <div className='flex items-center gap-5 justify-end pt-5 border-t w-full'>
                <Button className='w-36' type='button' onClick={() => setOpen(false)} variant={'ghost'}>Close</Button>
                <Button className='w-36'>Confirm</Button>
            </div>
        </form>
    )
}

const TransferSaveForm = ({ setAcceptedTerms, setOpen, writeContractAsync, isPending, setSuccess }: {
    setAcceptedTerms: React.Dispatch<React.SetStateAction<boolean>>
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    writeContractAsync: WriteContractMutateAsync<Config, unknown>
    setSuccess: React.Dispatch<React.SetStateAction<boolean>>
    isPending: boolean
}) => {

    const [transferData, setTransferData] = useState({
        wallet: '',
        amount: ''
    })

    const transferToken = async (e: FormEvent) => {

        e.preventDefault()

        const { amount, wallet } = transferData

        //check if the amount is positive number
        if (Number(transferData.amount) <= 0) return toast.error("Amount should be positive")

        const totalAmount = Number(amount) * 10000000000
        try {

            const data = await writeContractAsync({
                abi: ABI,
                address: '0xb70F970876638a33859600B9E64BEAd0fD22b065',
                functionName: 'transfer',
                args: [
                    wallet,
                    totalAmount
                ],
            })

            if (data) {
                setSuccess(true)
                toast.success("Success! token has been transfered")
            }

        } catch (err) {
            console.log(err);
            toast.error("Make sure you have enough token to transfer")
        }
    }

    return (
        <form className='flex flex-col gap-4' onSubmit={transferToken}>
            <h1 className='text-2xl pb-3'>Transfer Save</h1>
            <div className='flex flex-col gap-2'>
                <Label>Wallet Address</Label>
                <Input required value={transferData.wallet} onChange={(e) => setTransferData(prev => ({ ...prev, wallet: e.target.value }))} />
            </div>
            <div className='flex flex-col gap-2'>
                <Label>Amount</Label>
                <Input required type='number' value={transferData.amount} onChange={(e) => setTransferData(prev => ({ ...prev, amount: e.target.value }))} />
            </div>
            <div className='flex items-center justify-between pt-5 border-t'>
                <Button className='w-32' type='button' onClick={() => {
                    setOpen(false)
                    setTimeout(() => {
                        setAcceptedTerms(false)
                    }, 1000)
                }} variant={'ghost'}>Close</Button>
                <Button className='w-32'>{isPending ? <LoaderCircle size={16} className='animate-spin' /> : "Confirm"}</Button>
            </div>
        </form>
    )
}

export default TransferSave