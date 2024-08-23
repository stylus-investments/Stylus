import React, { useEffect, useState } from 'react'
import { trpc } from '@/app/_trpc/client'
import { toast } from 'sonner'
import { currency_conversion } from '@prisma/client'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PAYMENT_METHOD } from '@/constant/order'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { INFO } from '@/constant/info'

const EnterAmount = (props: {
    formData: {
        amount: string;
        method: string;
        price: string
        receipt: string
        status: number;
    }
    setFormData: React.Dispatch<React.SetStateAction<{
        amount: string;
        method: string;
        receipt: string
        price: string
        status: number;
    }>>
    closeOrder: () => void
    usdcPrice: string
    setCurrency: (currency: string) => void
    currency: string
}) => {

    const { setFormData, formData, closeOrder, usdcPrice, currency, setCurrency } = props
    const { data: exchangeRates } = trpc.currency.get.useQuery()
    const [open, setOpen] = useState(false)
    const [conversionRate, setConversionRate] = useState<number>(1);

    const confirmAmount = () => {
        const { amount, price, method } = formData
        if (!method) return toast.error("Payment method is required")
        if ((Number(amount) || Number(price)) <= 0) return toast.error("Amount should be positive number")
        if (isNaN(Number(amount)) || isNaN(Number(price))) {
            return toast.error("Amount and price should be valid numbers");
        }
        setFormData(prev => ({ ...prev, status: 2 }))
    }

    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newAmount = parseFloat(event.target.value);
        let newPriceInUsd = newAmount * Number(usdcPrice);
        let newPriceInPhp = newPriceInUsd * conversionRate;

        if (newPriceInPhp > 500000) {
            newPriceInPhp = 500000;
            // Recalculate the amount based on the capped price in PHP
            newPriceInUsd = newPriceInPhp / conversionRate;
            const cappedAmount = newPriceInUsd / Number(usdcPrice);
            if (Number(formData.price) !== 5000000) {
                setFormData(prev => ({ ...prev, amount: cappedAmount.toFixed(4), price: newPriceInPhp.toFixed(2) }));
                toast.error("Token purchase limit exceeded. Please contact our support team if you wish to purchase beyond this limit.");
            }
        } else {
            setFormData(prev => ({ ...prev, amount: newAmount.toString(), price: newPriceInPhp.toFixed(2) }));
        }
    };
    const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let newPrice = parseFloat(event.target.value);
        newPrice = Math.min(newPrice, 500000); // Ensure the price does not exceed 500000

        const newPriceInUsd = (currency === 'USD') ? newPrice : newPrice / conversionRate;
        const newAmount = newPriceInUsd / Number(usdcPrice);
        setFormData(prev => ({ ...prev, amount: newAmount.toFixed(4), price: newPrice.toString() }));
    };

    useEffect(() => {

        if (exchangeRates) {
            setCurrency("PHP")
            const rate = exchangeRates.find((rate: currency_conversion) => rate.currency === "PHP")?.conversion_rate;
            setConversionRate(rate ? parseFloat(rate) : 1);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exchangeRates])

    useEffect(() => {

        if (formData.amount && conversionRate) {
            const newAmount = parseFloat(formData.amount);
            const newPriceInUsd = newAmount * Number(usdcPrice);
            const newPrice = (currency === 'USD') ? newPriceInUsd : newPriceInUsd * conversionRate;
            setFormData(prev => ({ ...prev, price: newPrice.toFixed(2) }));
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversionRate, usdcPrice])

    return (
        <div className='flex flex-col gap-5'>
            <h1 className='border-b pb-5 text-lg'>Order Form</h1>
            <div className='flex flex-col gap-2'>
                <Label>Payment Method</Label>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between uppercase"
                        >
                            {formData.method
                                ? formData.method
                                : "Select Payment Method"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                        <Command>
                            <CommandInput placeholder="Search Payment Method" />
                            <CommandList>
                                <CommandEmpty>No method found.</CommandEmpty>
                                <CommandGroup>
                                    {Object.keys(PAYMENT_METHOD).map((method, i) => (
                                        <CommandItem
                                            key={i}
                                            value={method}
                                            onSelect={(currentValue) => {
                                                setFormData(prev => ({ ...prev, method: currentValue }))
                                                setOpen(false)
                                            }}
                                            className='uppercase'
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    formData.method === method ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {method}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
            <div className='flex flex-col gap-2'>
                <Label>Amount (SAVE)</Label>
                <Input type="number" value={formData.amount} onChange={handleAmountChange} />
            </div>
            <div className='flex flex-col gap-2'>
                <Label>Price</Label>
                <div className='flex items-center gap-3'>
                    <Input type="number" value={formData.price} onChange={handlePriceChange} />
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

export default EnterAmount