'use client'
import { user_cashout } from '@prisma/client'
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTrigger } from '@/components/ui/alert-dialog'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { trpc } from '@/app/_trpc/client'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { LoaderCircle } from 'lucide-react'
import useGlobalStore from '@/state/globalStore'
import { useRouter } from 'next/navigation'

const UpdateCashout = ({ data }: {
    data: user_cashout
}) => {

    const router = useRouter()

    const [confirmForm, setConfirmForm] = useState(false)
    const [open, setOpen] = useState(false)

    const { copyText } = useGlobalStore()

    const updateCashout = trpc.cashout.uCashoutStatus.useMutation({
        onError: (e) => toast.error(e.message),
        onSuccess: () => {
            router.refresh()
            toast.success('Cashout status updated successfully')
            setOpen(false)
        }
    })

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button className='h-7'>Paid</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>Confirm Payment</AlertDialogHeader>
                <AlertDialogDescription>Are you sure this payment is completed?</AlertDialogDescription>

                <form className="space-y-4 w-full" onSubmit={async (e) => {
                    e.preventDefault()
                    if (!confirmForm) return toast.error("Please confirm if this is paid.")
                    updateCashout.mutateAsync({
                        cashout_id: data.id
                    })
                }}>
                    <div className='w-full flex items-center gap-5'>
                        <div className='flex flex-col gap-1.5'>
                            <Label>Select Token</Label>
                            <Input readOnly value={data.token_name} />
                        </div>
                        <div className='flex flex-col gap-1.5'>
                            <Label>Payment Method</Label>
                            <Input readOnly value={data.payment_method} />
                        </div>
                    </div>
                    <div className='flex flex-col gap-1.5' onClick={() => copyText(data.account_name)}>
                        <Label>Account Name</Label>
                        <Input readOnly value={data.account_name} />
                    </div>
                    <div className='flex flex-col gap-1.5' onClick={() => copyText(data.account_number)}>
                        <Label>Account Number</Label>
                        <Input readOnly value={data.account_number} />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <Label>Received Amount</Label>
                        <Input readOnly value={data.amount} />
                    </div>
                    <div className='flex flex-col gap-1.5' onClick={() => copyText(String(Number(data.amount) * 0.95))}>
                        <Label>Money To Send</Label>
                        <Input readOnly value={Number(data.amount) * 0.95} />
                    </div>

                    <Separator />
                    <div className='flex w-full items-center gap-3'>
                        <Checkbox className='w-5 h-5' id='confirmCashout' checked={confirmForm} onCheckedChange={() => setConfirmForm(prev => !prev)} />
                        <Label htmlFor='confirmCashout'>
                            I confirm that this cashout request is paid.
                        </Label>
                    </div>
                    <Separator />
                    <div className='flex w-full items-center gap-5 '>
                        <Button type='button' variant={'secondary'} className='w-full' onClick={() => setOpen(false)}>Close</Button>
                        <Button className='w-full' disabled={updateCashout.isPending}>{updateCashout.isPending ? <LoaderCircle size={18} className='animate-spin' /> : "Confirm"}</Button>
                    </div>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default UpdateCashout