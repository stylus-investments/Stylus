'use client'
import { trpc } from '@/app/_trpc/client'
import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import ScanQr from './scan-qr'
import VerifyOrder from './verify-order'
import { toast } from 'sonner'
import { Currency } from '@prisma/client'
import SelectPaymentMethod from './select-payment-method'
import { socket } from '@/lib/socket'
import { useRouter } from 'next/navigation'
import { ORDERSTATUS } from '@/constant/order'

interface Props {
    investmentPrice: number
    currency: Currency
    orderID: string
}

const PayInvestmentPlan = ({
    investmentPrice,
    currency,
    orderID,
}: Props) => {

    const [open, setOpen] = useState(false)

    const router = useRouter()

    const [formData, setFormData] = useState({
        amount: '',
        price: investmentPrice,
        method: '',
        receipt: '',
        status: 1
    })
    const [confirmed, setConfirmed] = useState(false)

    const { data } = trpc.token.getIndexPrice.useQuery(undefined, {
        refetchInterval: formData.status === 1 && open ? 30000 : false
    })

    const updateOrder = trpc.order.payOrder.useMutation()

    const closeOrder = () => {
        setOpen(false)
    }

    const formBack = () => {
        setFormData(prev => ({ ...prev, status: prev.status - 1 }))
    }

    useEffect(() => {
        if (data && investmentPrice) {
            const indexPrice = data
            const amount = investmentPrice / indexPrice.php
            setFormData(prev => ({ ...prev, amount: amount.toFixed(6) }))
        }
    }, [data, investmentPrice])

    const confirmOrder = async (e: React.MouseEvent) => {
        try {
            e.preventDefault()

            if (!confirmed) return toast.error("Confirm the transaction first.")

            const data = await updateOrder.mutateAsync({
                data: {
                    receipt: formData.receipt,
                    method: formData.method,
                    order_id: orderID
                }
            })

            if (data) {
                socket.emit("newOrder", data)
                toast.success("Success!")
                setOpen(false)
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('status', ORDERSTATUS['processing']);
                router.push(currentUrl.toString())
            }

        } catch (error: any) {
            if (error.shape.message) {
                setOpen(false)
                return toast.error(error.shape.message)
            }
            alert("Something went wrong")
        }
    }

    useEffect(() => {
        socket.connect()

        return () => {
            socket.disconnect()
        }
    }, [])


    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button className='w-full h-7'>
                    Pay Now
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className='w-full max-w-96 max-h-[600px] overflow-y-auto'>
                {formData.status === 1 && <SelectPaymentMethod
                    setFormData={setFormData}
                    formData={formData}
                    closeOrder={closeOrder}
                    indexPrice={data?.php}
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
                    createOrderPending={updateOrder.isPending}
                    confirmed={confirmed}
                    formBack={formBack}
                />}
            </AlertDialogContent>
        </AlertDialog>
    )
}



export default PayInvestmentPlan