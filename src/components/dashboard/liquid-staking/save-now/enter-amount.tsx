import React, { useEffect, useState } from 'react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { availableCurrencies } from '@/constant/availableCurrency'
import { trpc } from '@/app/_trpc/client'
import { toast } from 'sonner'
import { currency_conversion } from '@prisma/client'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const EnterAmount = (props: {
    formData: {
        amount: string;
        method: string;
        price: string
        transaction_id: string;
        status: number;
    }
    setFormData: React.Dispatch<React.SetStateAction<{
        amount: string;
        method: string;
        price: string
        transaction_id: string;
        status: number;
    }>>
    closeOrder: () => void
    usdcPrice: string
    setCurrency: (currency: string) => void
    currency: string
}) => {

    const { setFormData, formData, closeOrder, usdcPrice, currency, setCurrency } = props


    const { data: exchangeRates } = trpc.currency.get.useQuery()

    const [conversionRate, setConversionRate] = useState<number>(1);


    const confirmAmount = () => {
        const { amount, price, method } = formData
        if (!method) return toast.error("Payment method is required")
        if ((Number(amount) || Number(price)) <= 0) return toast.error("Amount should be positive number")
        setFormData(prev => ({ ...prev, status: 2 }))
    }

    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newAmount = parseFloat(event.target.value);
        const newPriceInUsd = newAmount * Number(usdcPrice);
        const newPrice = (currency === 'USD') ? newPriceInUsd : newPriceInUsd * conversionRate;
        setFormData(prev => ({ ...prev, amount: newAmount.toString(), price: newPrice.toFixed(2) }));
    };

    const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newPrice = parseFloat(event.target.value);
        const newPriceInUsd = (currency === 'USD') ? newPrice : newPrice / conversionRate;
        const newAmount = newPriceInUsd / Number(usdcPrice);
        setFormData(prev => ({ ...prev, amount: newAmount.toFixed(4), price: newPrice.toString() }));
    }

    useEffect(() => {

        if (exchangeRates) {
            const rate = exchangeRates.find((rate: currency_conversion) => rate.currency === currency)?.conversion_rate;
            setConversionRate(rate ? parseFloat(rate) : 1);
        }

    }, [exchangeRates, currency]);

    useEffect(() => {

        if (formData.amount && conversionRate) {
            const newAmount = parseFloat(formData.amount);
            const newPriceInUsd = newAmount * Number(usdcPrice);
            const newPrice = (currency === 'USD') ? newPriceInUsd : newPriceInUsd * conversionRate;
            setFormData(prev => ({ ...prev, price: newPrice.toFixed(2) }));
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversionRate, usdcPrice]);

    return (
        <div className='flex flex-col gap-5'>
            <h1 className='border-b pb-5 text-lg'>Order Form</h1>
            <div className='flex flex-col gap-2'>
                <Label>Payment Method</Label>
                <Select value={formData.method} onValueChange={(value) => setFormData(prev => ({ ...prev, method: value }))}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Method" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="gcash">GCASH</SelectItem>
                        <SelectItem value="bpi">BPI</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className='flex flex-col gap-2'>
                <Label>Amount (SAVE)</Label>
                <Input type="number" value={formData.amount} onChange={handleAmountChange} />
            </div>
            <div className='flex flex-col gap-2'>
                <Label>Price</Label>
                <div className='flex items-center gap-3'>
                    <Input type="number" value={formData.price} onChange={handlePriceChange} />
                    <Select value={currency} onValueChange={(value) => setCurrency(value)}>
                        <SelectTrigger className='w-20'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Currency</SelectLabel>
                                {availableCurrencies.map((obj, i) => (
                                    <SelectItem value={obj.currency} key={i} >
                                        {obj.currency}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className='flex items-center justify-between w-full pt-5 border-t'>
                <Button variant={'ghost'} className='w-32' type='button' onClick={closeOrder}>Close</Button>
                <Button className='w-32' type='button' onClick={confirmAmount}>Next</Button>
            </div>
        </div>
    )
}

export default EnterAmount