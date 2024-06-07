import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { faEye, faEyeSlash, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import React, { useState } from 'react'

const VerifyOrder = (props: {
    formData: {
        amount: string;
        method: string;
        price: string;
        receipt: string
        transaction_id: string;
        status: number;
    }
    currency: string
    formBack: () => void
    createOrderPending: boolean
    confirmed: boolean
    setConfirmed: React.Dispatch<React.SetStateAction<boolean>>
    confirmOrder: (e: React.MouseEvent) => Promise<string | number | undefined>
}) => {

    const { formData, currency, formBack, confirmed, setConfirmed, confirmOrder, createOrderPending } = props

    const [showReceipt, setShowReceipt] = useState(false)

    return (
        <div className='flex flex-col gap-5'>
            <h1 className='border-b pb-5 text-lg'>Summary</h1>
            {showReceipt && <div className='flex flex-col gap-2'>
                <Label>Uploaded Recept:</Label>
                <Image width={200} height={50} className='w-full h-auto' src={formData.receipt} alt='Receipt' />
            </div>}
            <Button
                className='self-start flex items-center gap-3'
                onClick={() => setShowReceipt(prev => !prev)} variant={'ghost'}>
                {showReceipt ? "Hide Uploaded Receipt" : "Show Uploaded Receipt"}
                <FontAwesomeIcon icon={showReceipt ? faEyeSlash : faEye} width={16} height={16} />
            </Button>
            <div className='flex w-full items-center gap-5'>
                <div className='flex flex-col gap-2'>
                    <Label>Payment Method </Label>
                    <Input value={formData.method.toUpperCase()} />
                </div>
                <div className='flex flex-col gap-2'>
                    <Label>Amount (SAVE)</Label>
                    <Input value={formData.amount} />
                </div>
            </div>
            <div className='flex flex-col gap-2'>
                <Label>Price ({currency})</Label>
                <Input value={formData.price} />
            </div>
            <div className='flex flex-col gap-2'>
                <Label>Transaction  ID</Label>
                <Input value={formData.transaction_id} />
            </div>
            <div className='flex items-center gap-5'>
                <Checkbox id='confirmed' checked={confirmed} onCheckedChange={() => setConfirmed(prev => !prev)} />
                <Label htmlFor='confirmed' className='text-base font-normal'>
                    I confirm that the information provided is accurate and complete.
                </Label>
            </div>
            <div className='flex items-center justify-between w-full pt-5 border-t'>
                <Button variant={'ghost'} className='w-32' type='button' onClick={formBack}>Back</Button>
                <Button className='w-32' type='button' onClick={confirmOrder}>{createOrderPending ?
                    <FontAwesomeIcon icon={faSpinner} width={16} height={16} className='animate-spin' />
                    : "Create Order"}</Button>
            </div>
        </div>
    )
}


export default VerifyOrder