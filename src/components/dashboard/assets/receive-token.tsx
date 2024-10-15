'use client'
import React, { useRef, useState } from 'react';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { QRCode } from 'react-qrcode-logo';
import { usePrivy } from '@privy-io/react-auth';
import useGlobalStore from '@/state/globalStore';
import { toast } from 'sonner';

const ReceiveToken = () => {

    const [open, setOpen] = useState(false)
    const { user } = usePrivy()
    const qrRef = useRef<any>(null)
    const { copyText } = useGlobalStore()
    const download = () => {
        qrRef.current.download('png', 'wallet')
        toast.success("Success! QR has been downloaded.")
    }

    return (
        <div>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogTrigger asChild>
                    <div className='flex flex-col gap-1.5 items-center'>
                        <Button className='w-11 h-11 p-0 rounded-full' variant={'secondary'}>
                            <ArrowDown size={20} />
                        </Button>
                        <Label className='text-sm font-normal'>Receive</Label>
                    </div>
                </AlertDialogTrigger>
                <AlertDialogContent className='w-full max-w-96 flex flex-col items-center'>
                    <QRCode
                        value={user?.wallet?.address}
                        logoImage='/icons/logo/logo.png'
                        logoHeight={75}
                        ref={qrRef}
                        logoWidth={75}
                        size={300}
                        logoPaddingStyle='circle'
                    />
                    <div className='flex items-center gap-5 justify-between p-3 border w-full rounded-xl'>
                        <div className='flex flex-col gap-1'>
                            <div className='font-bold text-muted-foreground'>Your Wallet Address</div>
                            <Label>{`${user?.wallet?.address?.slice(0, 6)}...${user?.wallet?.address?.slice(-4)}`}</Label>
                        </div>
                        <Button onClick={() => copyText(user?.wallet?.address || "", "Wallet address has ben copied.")}>Copy</Button>
                    </div>
                    <small className='text-muted-foreground text-center'>
                        Use this address for receiving tokens and NFTs on Ethereum,Base,Polygon,Avalanche,Arbitrum, and other compatible networks.
                        Transactions may take a few minutes to complete.
                    </small>
                    <div className='flex flex-row items-center w-full gap-5'>
                        <Button variant={'secondary'} className='w-full' onClick={() => setOpen(false)}>
                            Close
                        </Button>
                        <Button className='w-full' onClick={download}>Download QR</Button>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default ReceiveToken