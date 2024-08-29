'use client'
import { trpc } from '@/app/_trpc/client'
import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import ScanQr from './scan-qr'
import VerifyOrder from './verify-order'
import { toast } from 'sonner'
import { Currency, user_investment_plan } from '@prisma/client'
import SelectPaymentMethod from './select-payment-method'

const PayInvestmentPlan = ({ investment, currency }: { investment: user_investment_plan, currency: Currency }) => {

    const [open, setOpen] = useState(false)

    const [formData, setFormData] = useState({
        amount: '',
        price: investment.total_price,
        method: '',
        receipt: '',
        status: 1
    })
    const [confirmed, setConfirmed] = useState(false)

    const { data } = trpc.token.getIndexPrice.useQuery(undefined, {
        refetchInterval: formData.status === 1 && open ? 30000 : false
    })

    const getUserOrder = trpc.order.getCurrentUserOrder.useQuery(undefined, {
        refetchOnMount: false,
        enabled: false
    })

    const createOrder = trpc.order.createOrder.useMutation()

    const closeOrder = () => {
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
                    receipt: formData.receipt,
                    method: formData.method,
                    investment_plan_id: investment.id
                }
            })

            if (result) {
                await getUserOrder.refetch()
                toast.success("Success! order has been created.")
                setOpen(false)

            }

        } catch (error: any) {
            if (error.shape.message) {
                setOpen(false)
                return toast.error(error.shape.message)
            }
            alert("Something went wrong")
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button className='w-full'>
                    Create
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className='w-full max-w-96 max-h-[600px] overflow-y-auto'>
                {formData.status === 1 && <SelectPaymentMethod
                    setFormData={setFormData}
                    formData={formData}
                    closeOrder={closeOrder}
                    indexPrice={data}
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



export default PayInvestmentPlan