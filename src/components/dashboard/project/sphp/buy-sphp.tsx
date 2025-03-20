'use client'
import { trpc } from '@/app/_trpc/client'
import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { socket } from '@/lib/socket'
import { redirect, useRouter } from 'next/navigation'
import SPHPSelectPayment from './select-payment-method'
import BuyTokenScanQr from './scan-qr'
import VerifyBuySPHP from './verify-buy-sphp'

const BuySPHP = () => {

    const [open, setOpen] = useState(false)

    const router = useRouter()

    const [formData, setFormData] = useState({
        amount: '',
        method: '',
        receipt: '',
        status: 1
    })
    const [confirmed, setConfirmed] = useState(false)

    const { data } = trpc.token.getIndexPrice.useQuery(undefined, {
        refetchInterval: formData.status === 1 && open ? 30000 : false
    })

    const buyToken = trpc.token.buySPHPToken.useMutation({
        onError: (err) => {
            toast.error(err.message)
        },
        onSuccess: () => {
            toast.success("Success!")
            setOpen(false)
            redirect('dashboard/wallet/sphp-orders')
        }
    })

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

            await buyToken.mutateAsync({
                amount: formData.amount,
                method: formData.method,
                receipt: formData.receipt
            })

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
                <Button className='min-w-28 w-28'>Cash in</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className='w-full max-w-96 max-h-[600px] overflow-y-auto'>
                {formData.status === 1 &&
                    <SPHPSelectPayment
                        closeOrder={closeOrder}
                        formData={formData}
                        setFormData={setFormData}
                    />
                }
                {formData.status === 2 &&
                    <BuyTokenScanQr
                        formBack={formBack}
                        formData={formData}
                        setFormData={setFormData}
                    />
                }
                {formData.status === 3 &&
                    <VerifyBuySPHP
                        formBack={formBack}
                        formData={formData}
                        confirmOrder={confirmOrder}
                        setConfirmed={setConfirmed}
                        confirmed={confirmed}
                        buyTokenPending={buyToken.isPending}

                    />
                }
            </AlertDialogContent>
        </AlertDialog>
    )
}



export default BuySPHP