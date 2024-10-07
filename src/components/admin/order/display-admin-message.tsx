'use client'
import React, { useEffect, useState } from 'react'
import OrderMessageForm from './order-message-form'
import ToggleOrderConversation from './toggle-order-conversation'
import InvalidOrder from './invalid-order'
import CompleteOrder from './complete-order'
import { socket } from '@/lib/socket'
import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { trpc } from '@/app/_trpc/client'
import { CircleX, LoaderCircle } from 'lucide-react'

const DisplayAdminMessages = ({ orderID, unseen }: {
    orderID: string
    unseen: number
}) => {

    const [open, setOpen] = useState(false)

    const { data: order } = trpc.message.getOrderMessages.useQuery({ sender: 'admin', orderID }, {
        enabled: open
    })

    useEffect(() => {

        if (open) {

            // Join the order room when the component mounts
            socket.emit('joinOrder', { orderID })
            // eslint-disable-next-line react-hooks/exhaustive-deps
            return () => {
                socket.off('joinOrder')
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderID, open])

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <div className='relative w-32'>
                    <Button className='h-7 w-full'>
                        Chat
                    </Button>
                    {unseen ?
                        <div className=' absolute bg-destructive text-white px-2 py-1 shadow-2xl text-xs rounded-br-full rounded-t-full -right-4 -top-4'>{unseen}</div>
                        : null
                    }
                </div>
            </AlertDialogTrigger>
            <AlertDialogContent className='w-full'>
                <div className='gap-3 flex flex-col w-full sm:w-auto'>
                    {order ? <OrderMessageForm initialData={order as any} sender='admin' /> :
                        <div className='w-full h-[500px] grid place-items-center'>
                            <LoaderCircle size={40} className='animate-spin text-primary' />
                        </div>}
                    <div className='flex justify-center items-center gap-2 sm:gap-5'>
                        <ToggleOrderConversation orderID={orderID} closed={order?.closed} />
                        <InvalidOrder orderID={orderID} />
                        <CompleteOrder orderID={orderID} />
                        <div className='flex flex-col gap-1 items-center p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full justify-center min-w-16 h-16 cursor-pointer' onClick={() => setOpen(false)}>
                            <CircleX size={20} />
                            <small>Close</small>
                        </div>
                    </div>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DisplayAdminMessages