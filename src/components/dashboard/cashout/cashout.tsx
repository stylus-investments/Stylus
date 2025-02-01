'use client'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { HandCoins } from 'lucide-react'
import React, { useState } from 'react'
import CashoutConvert from './cashout-convert'
import CashoutCompound from './cashout-compound'

const Cashout = () => {

    const [open, setOpen] = useState(false)

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <div className='flex flex-col gap-1.5 items-center'>
                    <Button className='w-11 h-11 p-0 rounded-full' variant={'secondary'}>
                        <HandCoins size={20} />
                    </Button>
                    <Label className='text-sm font-normal'>Cashout</Label>
                </div>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Select Cashout Option</AlertDialogTitle>
                </AlertDialogHeader>
                <div className='flex flex-col gap-5'>
                    <div className='space-y-2 flex items-center justify-between'>
                        <div className='space-y-1 flex flex-col'>
                            <Label>Convert To PHP</Label>
                            <small className='text-muted-foreground'>Convert your SPHP into real money.</small>
                        </div>
                        <CashoutConvert />
                    </div>
                    <Separator />
                    <div className='space-y-2 flex items-center justify-between'>
                        <div className='space-y-1 flex flex-col'>
                            <Label>Compound to sAVE</Label>
                            <small className='text-muted-foreground'>Convert your SPHP into sAVE to compound.</small>
                        </div>
                        <CashoutCompound />
                    </div>
                </div>
                <Separator />
                <div className='flex w-full items-center gap-5 '>
                    <Button type='button' variant={'secondary'} className='w-full' onClick={() => setOpen(false)}>Close</Button>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default Cashout