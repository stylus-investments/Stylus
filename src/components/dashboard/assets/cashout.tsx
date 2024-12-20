'use client'
import { trpc } from '@/app/_trpc/client'
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { SPHP } from '@/lib/token_address'
import { HandCoins } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'

const Cashout = () => {

    const [open, setOpen] = useState(false)
    const [tokenAddress, setTokenAddress] = useState(SPHP)
    const { data, isError } = trpc.dashboard.getAssetData.useQuery(tokenAddress, {
        retry: false
    })

    if (!data) return (
        <div className='flex flex-col gap-1.5 items-center' onClick={() => toast.error(isError ? "You don't have SPHP to cashout" : "Loading please wait...")}>
            <Button className='w-11 h-11 p-0 rounded-full' variant={'secondary'}>
                <HandCoins size={20} />
            </Button>
            <Label className='text-sm font-normal'>Cashout</Label>
        </div>
    )

    return (
        <div>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogTrigger asChild>
                    <div className='flex flex-col gap-1.5 items-center'>
                        <Button className='w-11 h-11 p-0 rounded-full' variant={'secondary'}>
                            <HandCoins size={20} />
                        </Button>
                        <Label className='text-sm font-normal'>Cashout</Label>
                    </div>
                </AlertDialogTrigger>
                <AlertDialogContent className='max-w-96'>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cashout Token</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to cashout {data?.name}. Review the details carefully before confirming.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <form>
                        <Select>
                            <SelectTrigger>Select Token</SelectTrigger>
                            <SelectContent>
                                <SelectItem value={SPHP}>{data?.name}</SelectItem>
                            </SelectContent>
                        </Select>
                    </form>
                    <Button onClick={() => setTokenAddress('')}>Close</Button>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default Cashout