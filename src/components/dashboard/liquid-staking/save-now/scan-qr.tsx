import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useState } from 'react'
import { toast } from 'sonner';
import Image from 'next/image'
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { UploadButton } from '@/lib/utils';
import { CircleCheck } from 'lucide-react';


const ScanQr = (props: {
    formData: {
        amount: string;
        method: string;
        price: string;
        receipt: string
        status: number;
    }
    setFormData: React.Dispatch<React.SetStateAction<{
        amount: string;
        method: string;
        receipt: string
        price: string;
        status: number;
    }>>
    currency: string
    formBack: () => void

}) => {

    const { setFormData, formData, currency, formBack } = props

    const [show, setShow] = useState(false)

    const confirmTransaction = () => {
        const { receipt } = formData
        if (!receipt) return toast.error("Receipt is required.")
        setFormData(prev => ({ ...prev, status: 3 }))
    }

    return (
        <div className='flex flex-col w-full gap-5'>
            <h1 className='border-b pb-5 text-lg'>Scan Qr To Pay</h1>

            {show && <Image src={'/qrpay.webp'} alt='Scan To Pay' width={350} height={250} className='h-auto w-full' />}
            <div className='flex items-center gap-5'>
                <Button variant={'secondary'} className='w-full' onClick={() => setShow(prev => !prev)}>{show ? "Hide QR Code" : "Show QR Code"}</Button>
                <a href="/qrpay.webp" download="savernpayqrcode.webp" className='w-full'>
                    <Button className='flex items-center gap-3' variant={'link'}>
                        Download QR
                        <FontAwesomeIcon icon={faDownload} width={16} height={16} />
                    </Button>
                </a>
            </div>
            <div className='text-muted-foreground text-sm'>
                Please proceed with a purchase of {formData.amount} SAVE tokens, equivalent to {formData.price} {currency}. Payment should be made using ({formData.method.toUpperCase()}) option.
                Scan the QR code above to complete your transaction.
            </div>
            <div className='flex gap-3 items-center justify-between'>
                <Label className='text-base'>Upload Receipt:</Label>
                <UploadButton
                    endpoint='orderReceiptUploader'
                    onClientUploadComplete={(res) => {
                        setFormData(prev => ({ ...prev, receipt: res[0].url }))
                        toast.success("Upload Complete");
                    }}
                    onUploadError={(error: Error) => {
                        // Do something with the error.
                        toast.error(`ERROR! ${error.message}`);
                    }}
                    appearance={{
                        button: 'bg-muted text-foreground',
                        allowedContent: 'hidden'
                    }}
                />
                {formData.receipt && <CircleCheck size={25} className='text-primary' />}
            </div>
            <div className='flex items-center justify-between w-full pt-5 border-t'>
                <Button variant={'ghost'} className='w-32' type='button' onClick={formBack}>Back</Button>
                <Button className='w-32' type='button' onClick={confirmTransaction} >Next</Button>
            </div>
        </div>
    )
}


export default ScanQr