'use client'
import { trpc } from '@/app/_trpc/client'
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { LoaderCircle, MessageCircleMore, MessageCircleOff } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'

const ToggleOrderConversation = ({ orderID, closed }: { orderID: string, closed: boolean }) => {

    const [open, setOpen] = useState(false)

    const { mutateAsync, isPending } = trpc.order.toggleOrderConversation.useMutation({
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
                {!closed ? <div className='flex flex-col gap-1 items-center p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full justify-center w-16 h-16 cursor-pointer'>
                    <MessageCircleOff size={20} />
                    <small>Close</small>
                </div> :
                    <div className='flex flex-col gap-1 items-center p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full justify-center w-16 h-16 cursor-pointer'>
                        <MessageCircleMore size={20} />
                        <small>Open</small>
                    </div>
                }
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you sure you want to {closed ? "open" : "close"} this conversation?
                    </AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter className='flex flex-row items-center gap-5'>
                    <Button variant={'secondary'} className='w-full' onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        disabled={isPending}
                        variant={closed ? "default" : "destructive"}
                        onClick={async (e) => await mutateAsync(orderID)}
                        className='w-full'>{isPending ? <LoaderCircle size={18} className='animate-spin' /> : "Yes I'm Sure"}</Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default ToggleOrderConversation