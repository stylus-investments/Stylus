import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ArrowDown, HandCoins, UserPlus } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import SentToken from './send-token'
import { caller } from '@/app/_trpc/server'

const AssetActions = ({ tokenData }: { 
    tokenData: Awaited<ReturnType<typeof caller['dashboard']['getAssetData']>>

 }) => {

    return (
        <div className='w-full flex items-center justify-between pt-3 text-muted-foreground sm:justify-center sm:gap-16 border-b pb-5'>
            <SentToken tokenData={tokenData} />
            <div className='flex flex-col gap-1.5 items-center'>
                <Button className='w-11 h-11 p-0 rounded-full' variant={'secondary'}>
                    <ArrowDown size={20} />
                </Button>
                <Label className='text-sm font-normal'>Receive</Label>
            </div>
            <div className='flex flex-col gap-1.5 items-center'>
                <Button className='w-11 h-11 p-0 rounded-full' variant={'secondary'}>
                    <HandCoins size={20} />
                </Button>
                <Label className='text-sm font-normal'>Cashout</Label>
            </div>
            <Link href={'/dashboard/referrals'} className='flex flex-col gap-1.5 items-center'>
                <Button className='w-11 h-11 p-0 rounded-full' variant={'secondary'}>
                    <UserPlus size={20} />
                </Button>
                <Label className='text-sm font-normal'>Refer</Label>
            </Link>
        </div>
    )
}

export default AssetActions