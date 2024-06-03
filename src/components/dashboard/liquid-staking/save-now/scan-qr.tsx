import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react'
import { toast } from 'sonner';
import Image from 'next/image'
import { Button } from '@/components/ui/button';


const ScanQr = (props: {
    formData: {
        amount: string;
        method: string;
        price: string;
        transaction_id: string;
        status: number;
    }
    setFormData: React.Dispatch<React.SetStateAction<{
        amount: string;
        method: string;
        price: string;
        transaction_id: string;
        status: number;
    }>>
    currency: string
    formBack: () => void

}) => {

    const { setFormData, formData, currency, formBack } = props

    const confirmTransaction = () => {
        const { transaction_id } = formData
        if (!transaction_id) return toast.error("Please enter transaction ID")
        setFormData(prev => ({ ...prev, status: 3 }))
    }

    return (
        <div className='flex flex-col gap-5'>
            <h1 className='border-b pb-5 text-lg'>Scan Qr To Pay</h1>

            <Image src={'/qrpay.jpeg'} alt='Scan To Pay' width={350} height={250} className='h-auto w-full' />
            <div>
                Please proceed with a purchase of {formData.amount} SAVE tokens, equivalent to {formData.price} {currency}. Payment should be made using ({formData.method.toUpperCase()}) option.
                Scan the QR code above to complete your transaction.
            </div>
            <div className='flex flex-col gap-2'>
                <Label>Transaction  ID</Label>
                <Input value={formData.transaction_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, transaction_id: e.target.value }))}
                    placeholder='Enter Transaction ID'
                />
            </div>
            <div className='flex items-center justify-between w-full pt-5 border-t'>
                <Button variant={'ghost'} className='w-32' type='button' onClick={formBack}>Back</Button>
                <Button className='w-32' type='button' onClick={confirmTransaction} >Next</Button>
            </div>
        </div>
    )
}


export default ScanQr