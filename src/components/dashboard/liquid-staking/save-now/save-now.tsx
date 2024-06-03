'use client'
import { trpc } from '@/app/_trpc/client'
import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import useBalanceStore from '@/state/balanceStore'
import React, { useState } from 'react'
import { toast } from 'sonner'
import EnterAmount from './enter-amount'
import ScanQr from './scan-qr'
import VerifyOrder from './verify-order'

const SaveNow = () => {

    const [open, setOpen] = useState(false)

    const [formData, setFormData] = useState({
        amount: '',
        method: '',
        price: '',
        transaction_id: '',
        status: 1
    })
    const [confirmed, setConfirmed] = useState(false)

    const { currency, setCurrency } = useBalanceStore()

    const usdcPrice = trpc.token.getTokenPrice.useQuery(process.env.NEXT_PUBLIC_USDC_ADDRESS as string, {
        refetchInterval: formData.status === 1 && open ? 5000 : false
    })

    const getUserOrder = trpc.order.getCurrentUserOrder.useQuery(undefined, {
        refetchOnMount: false,
    })

    const createOrder = trpc.order.createOrder.useMutation()

    const closeOrder = () => {
        setFormData({ amount: '', method: '', transaction_id: '', price: '', status: 1 })
        setOpen(false)
    }

    const formBack = () => {
        setFormData(prev => ({ ...prev, status: prev.status - 1 }))
    }

    const confirmOrder = async (e: React.MouseEvent) => {
        try {
            e.preventDefault()

            if (!confirmed) return toast.error("Confirm the transaction first.")

            const result = await createOrder.mutateAsync({
                data: {
                    amount: formData.amount,
                    price: formData.price,
                    transaction_id: formData.transaction_id,
                    method: formData.method,
                    currency
                }
            })

            if (result) {
                await getUserOrder.refetch()
                setFormData({ amount: '', method: '', transaction_id: '', price: '', status: 1 })
                toast.success("Success! order has been created.")
                setOpen(false)

            }

        } catch (error) {
            console.log(error);
            alert("Something went wrong")
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button className='w-full h-9' variant={'ghost'}>
                    Save Now
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className='max-w-96'>
                {formData.status === 1 && <EnterAmount
                    setFormData={setFormData}
                    currency={currency}
                    setCurrency={setCurrency}
                    formData={formData}
                    closeOrder={closeOrder}
                    usdcPrice={usdcPrice.data as string}
                />}
                {formData.status === 2 && <ScanQr
                    setFormData={setFormData}
                    formBack={formBack}
                    formData={formData}
                    currency={currency}
                />}
                {formData.status === 3 && <VerifyOrder
                    formData={formData}
                    currency={currency}
                    confirmOrder={confirmOrder}
                    setConfirmed={setConfirmed}
                    createOrderPending={createOrder.isPending}
                    confirmed={confirmed}
                    formBack={formBack}
                />}
            </AlertDialogContent>
        </AlertDialog>
    )
}



export default SaveNow