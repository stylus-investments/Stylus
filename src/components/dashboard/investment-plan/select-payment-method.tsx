import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PAYMENT_METHOD } from '@/constant/order'

const SelectPaymentMethod = (props: {
    formData: {
        amount: string;
        method: string;
        price: number
        receipt: string
        status: number;
    }
    setFormData: React.Dispatch<React.SetStateAction<{
        amount: string;
        method: string;
        receipt: string
        price: number
        status: number;
    }>>
    closeOrder: () => void
    indexPrice: number | undefined
}) => {

    const { setFormData, formData, closeOrder, indexPrice } = props
    const [open, setOpen] = useState(false)

    const confirmAmount = () => {
        const { amount, price, method } = formData
        if (!method) return toast.error("Payment method is required")
        if ((Number(amount) || Number(price)) <= 0) return toast.error("Amount should be positive number")
        if (isNaN(Number(amount)) || isNaN(Number(price))) {
            return toast.error("Amount and price should be valid numbers");
        }
        setFormData(prev => ({ ...prev, status: 2 }))
    }

    useEffect(() => {

        if (formData.amount && indexPrice) {
            const newAmount = formData.price / indexPrice;
            setFormData(prev => ({ ...prev, amount: newAmount.toFixed(6) }));
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [indexPrice])

    return (
        <div className='flex flex-col gap-5'>
            <h1 className='border-b pb-5 text-lg'>Order Form</h1>
            <div className='flex flex-col gap-2'>
                <Label>Payment Method</Label>
                <div className='flex items-center w-full gap-5'>
                    {Object.keys(PAYMENT_METHOD).map((method, i) => (
                        <Button
                            key={i}
                            variant={method === formData.method ? "default" : "secondary"}
                            value={method}
                            onClick={() => {
                                setFormData(prev => ({ ...prev, method: method }))
                                setOpen(false)
                            }}
                            className='uppercase w-full'
                        >

                            {method}
                        </Button>
                    ))}
                </div>
            </div>
            <div className='flex flex-col gap-2'>
                <Label>Amount (sBTC)</Label>
                <Input type="number" value={formData.amount} readOnly />
            </div>
            <div className='flex flex-col gap-2'>
                <Label>Price</Label>
                <div className='flex items-center gap-3'>
                    <Input type="number" value={formData.price} readOnly />
                    <Input value={'PHP'} readOnly className='w-20 text-center' />
                </div>
            </div>
            <div className='flex items-center justify-between w-full pt-5 border-t'>
                <Button variant={'ghost'} className='w-32' type='button' onClick={closeOrder}>Close</Button>
                <Button className='w-32' type='button' onClick={confirmAmount}>Next</Button>
            </div>
        </div>
    )
}

export default SelectPaymentMethod