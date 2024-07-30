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
import { HandCoins } from 'lucide-react'

const SaveNow = () => {

    const [open, setOpen] = useState(false)

    const [formData, setFormData] = useState({
        amount: '',
        method: '',
        price: '',
        receipt: '',
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

    const clearForm = () => {
        setFormData({ amount: '', method: '', price: '', status: 1, receipt: '' })
    }

    const closeOrder = () => {
        clearForm()
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
                    receipt: formData.receipt,
                    price: formData.price,
                    method: formData.method,
                    currency: 'PHP'
                }
            })

            if (result) {
                await getUserOrder.refetch()
                clearForm()
                toast.success("Success! order has been created.")
                setOpen(false)

            }

        } catch (error: any) {
            if (error.shape.message) {
                setOpen(false)
                clearForm()
                return toast.error(error.shape.message)
            }
            alert("Something went wrong")
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button className='w-full' variant={'secondary'}>
                    Deposit
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className='w-full max-w-96 max-h-[600px] overflow-y-auto'>
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