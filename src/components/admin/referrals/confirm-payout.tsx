'use client'
import { trpc } from '@/app/_trpc/client'
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PaymentMethods } from '@prisma/client'
import { Copy, LoaderCircle } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'

const ConfirmPayout = ({ payoutRequestData }: {
    payoutRequestData: {
        amount: string;
        id: string
        status: string;
        payment_method: PaymentMethods;
        payment_account_name: string;
        payment_account_number: string;
        created_at: string;
    }
}) => {

    const [open, setOpen] = useState(false)
    const [confirm, setConfirm] = useState(false)

    const { refetch } = trpc.referral.getAllPayouts.useQuery(undefined, {
        enabled: false
    })

    const { mutateAsync, isPending } = trpc.referral.confirmPayout.useMutation({
        onSuccess: () => {
            refetch()
            toast.success("Success! payout request completed.")
            setOpen(false)
        },
        onError: (err) => toast.error(err.message)
    })

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button className='h-8'>Pay Now</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className='w-full flex flex-col gap-5'>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Payment Request</AlertDialogTitle>
                    <AlertDialogDescription>Make sure to check the information before confirming.</AlertDialogDescription>
                </AlertDialogHeader>
                <div className='flex flex-col gap-5'>
                    <div className='flex items-center gap-5'>
                        <div className='flex flex-col gap-1.5 w-full'>
                            <Label>Amount</Label>
                            <div className='w-full relative cursor-pointer' onClick={() => {
                                navigator.clipboard.writeText(payoutRequestData.amount)
                                toast.success("Amount copied.")
                            }}>
                                <Input value={`₱${payoutRequestData.amount}`} readOnly className='cursor-pointer' />
                                <Copy size={30} className='absolute right-3 top-1.5 text-primary cursor-pointer w-10 px-2.5 bg-card' />
                            </div>
                            {/* <Input value={`₱${payoutRequestData.amount}`} readOnly /> */}
                        </div>
                        <div className='flex flex-col gap-1.5 w-full'>
                            <Label>Method</Label>
                            <Input readOnly value={payoutRequestData.payment_method} />
                        </div>
                    </div>
                    <div className='flex flex-col gap-1.5 w-full'>
                        <Label>Account Name</Label>
                        <div className='w-full relative cursor-pointer' onClick={() => {
                            navigator.clipboard.writeText(payoutRequestData.payment_account_name)
                            toast.success("Account name copied.")
                        }}>
                            <Input value={payoutRequestData.payment_account_name} readOnly className='cursor-pointer' />
                            <Copy size={30} className='absolute right-3 top-1.5 text-primary cursor-pointer w-10 px-2.5 bg-card' />
                        </div>
                    </div>
                    <div className='flex flex-col gap-1.5 w-full'>
                        <Label>Account Number</Label>
                        <div className='w-full relative cursor-pointer' onClick={() => {
                            navigator.clipboard.writeText(payoutRequestData.payment_account_number)
                            toast.success("Account number copied.")
                        }}>
                            <Input value={payoutRequestData.payment_account_number} readOnly className='cursor-pointer' />
                            <Copy size={30} className='absolute right-3 top-1.5 text-primary cursor-pointer w-10 px-2.5 bg-card' />
                        </div>
                    </div>
                    <div className='flex items-center gap-5'>
                        <Checkbox className='w-5 h-5' id='confirm' checked={confirm} onCheckedChange={() => setConfirm(prev => !prev)} />
                        <Label htmlFor='confirm' className='text-lg cursor-pointer'>
                            I confirm that payment is completed.
                        </Label>
                    </div>
                </div>
                <AlertDialogFooter className='flex flex-row items-center w-full gap-5 border-t pt-5'>
                    <Button variant={'secondary'} className='w-full'>Close</Button>
                    <Button
                        disabled={isPending}
                        className='w-full'
                        onClick={async () => {
                            if (!confirm) return toast.error("Please confirm that you have paid this request")
                            await mutateAsync(payoutRequestData.id)
                        }}>{isPending ? <LoaderCircle size={18} className='animate-spin' /> : "Confirm"}</Button>
                </AlertDialogFooter>

            </AlertDialogContent>
        </AlertDialog>
    )
}

export default ConfirmPayout