import React, { useState } from 'react'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { OrderProps } from './order-table'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faTrash } from '@fortawesome/free-solid-svg-icons'
import { trpc } from '@/app/_trpc/client'
import { toast } from 'sonner'

const InvalidOrderDialog = ({ order }: { order: OrderProps }) => {

    const [open, setOpen] = useState(false)
    const [confirmed, setConfirmed] = useState(false)

    const getAllOrders = trpc.order.getAll.useQuery(undefined, {
        refetchOnMount: false
    })
    const invalidOrder = trpc.order.invalidOrder.useMutation({
        onSuccess: async (data) => {
            if (data) {
                await getAllOrders.refetch()
                toast.success("Success! order updated.")
                setOpen(false)
            }
        }
    })

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <div className='flex items-center gap-3 p-2 w-full justify-between hover:bg-muted'>
                    <Label className='font-normal'>Invalid Order</Label>
                    <FontAwesomeIcon icon={faTrash} width={16} height={16} className='text-red-500' />
                </div>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure this order is invalid?</AlertDialogTitle>
                </AlertDialogHeader>
                <div className='flex flex-col gap-5'>
                    <div className='flex flex-col gap-2'>
                        <Label>Payment Method </Label>
                        <Input value={order.method.toUpperCase()} />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <Label>Amount (SAVE)</Label>
                        <Input value={order.amount} />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <Label>Price ({order.currency})</Label>
                        <Input value={order.price} />
                    </div>
                    <div className='flex items-center gap-5'>
                        <Checkbox id='confirmed' checked={confirmed} onCheckedChange={() => setConfirmed(prev => !prev)} />
                        <Label htmlFor='confirmed' className='text-base font-normal'>
                            I confirm that this order is invalid.
                        </Label>
                    </div>
                    <div className='flex items-center justify-between w-full pt-5 border-t'>
                        <Button variant={'ghost'} className='w-32' type='button' onClick={() => setOpen(false)}>Close</Button>
                        <Button className='w-32' type='button' onClick={() => invalidOrder.mutate(order.id)}>{invalidOrder.isPending ?
                            <FontAwesomeIcon icon={faSpinner} width={16} height={16} className='animate-spin' />
                            : "Invalid Order"}</Button>
                    </div>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default InvalidOrderDialog