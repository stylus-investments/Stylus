import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { HandCoins, UserPlus } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import SendToken from './send-token'
import ReceiveToken from './receive-token'

const AssetActions = ({ tokenAddress }: {
    tokenAddress: string

}) => {

    return (
        <div className='w-full flex items-center justify-between pt-3 text-muted-foreground sm:justify-center sm:gap-16 border-b pb-5'>
            <SendToken tokenAddress={tokenAddress} />
            <ReceiveToken />
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