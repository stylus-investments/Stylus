'use client'
import { trpc } from '@/app/_trpc/client'
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { CircleCheckBig, LoaderCircle } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'

const CompleteOrder = ({ orderID }: { orderID: string }) => {

    const [open, setOpen] = useState(false)

    const { mutateAsync, isPending } = trpc.order.completeOrder.useMutation({
        onSuccess: () => {
            toast.success("Success! Order updated")
            setOpen(false)
        },
        onError: (err) => {
            toast.error(err.message)
        }
    })

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <div className='flex flex-col gap-1 items-center p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full justify-center w-16 h-16 cursor-pointer'>
                    <CircleCheckBig size={20} />
                    <small>Valid</small>
                </div>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you sure this order is completed?
                    </AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter className='flex flex-row items-center gap-5'>
                    <Button variant={'secondary'} className='w-full' onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        disabled={isPending}
                        variant={'destructive'}
                        onClick={async (e) => await mutateAsync(orderID)}
                        className='w-full'>{isPending ? <LoaderCircle size={18} className='animate-spin' /> : "Yes I'm Sure"}</Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default CompleteOrder