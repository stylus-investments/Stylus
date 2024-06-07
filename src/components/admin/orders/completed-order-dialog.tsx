import React, { useState } from 'react'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { OrderProps } from './order-table'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { trpc } from '@/app/_trpc/client'
import { toast } from 'sonner'

const CompletedOrderDialog = ({ order }: { order: OrderProps }) => {

    const [open, setOpen] = useState(false)
    const [confirmed, setConfirmed] = useState(false)

    const getAllOrders = trpc.order.getAll.useQuery(undefined, {
        refetchOnMount: false
    })
    const confirmOrder = trpc.order.completeOrder.useMutation({
        onSuccess: async (data) => {
            if (data) {
                await getAllOrders.refetch()
                toast.success("Success! order completed.")
                setOpen(false)
            }
        },
        onError: (err) => {
            toast.error(err.message)
        }
    })

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <div className='flex items-center gap-3 p-2 w-full justify-between hover:bg-muted'>
                    <Label className='font-normal'>Complete Order</Label>
                    <FontAwesomeIcon icon={faCheck} width={16} height={16} className='text-green-500' />
                </div>
            </AlertDialogTrigger>
            <AlertDialogContent className='w-full max-w-96'>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure this order is completed?</AlertDialogTitle>
                </AlertDialogHeader>
                <div className='flex flex-col gap-5'>
                    <div className='flex w-full items-center gap-5'>
                        <div className='flex flex-col gap-2'>
                            <Label>Payment Method </Label>
                            <Input value={order.method.toUpperCase()} />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label>Amount (SAVE)</Label>
                            <Input value={order.amount} />
                        </div>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <Label>Price ({order.currency})</Label>
                        <Input value={order.price} />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <Label>Transaction  ID</Label>
                        <Input value={order.transaction_id} />
                    </div>
                    <div className='flex items-center gap-5'>
                        <Checkbox id='confirmed' checked={confirmed} onCheckedChange={() => setConfirmed(prev => !prev)} />
                        <Label htmlFor='confirmed' className='text-base font-normal'>
                            I confirm that this order is valid and completed.
                        </Label>
                    </div>
                    <div className='flex items-center justify-between w-full pt-5 border-t'>
                        <Button variant={'ghost'} className='w-32' type='button' onClick={() => setOpen(false)}>Close</Button>
                        <Button className='w-32' type='button' onClick={() => confirmOrder.mutate(order.id)}>{confirmOrder.isPending ?
                            <FontAwesomeIcon icon={faSpinner} width={16} height={16} className='animate-spin' />
                            : "Complete Order"}</Button>
                    </div>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default CompletedOrderDialog