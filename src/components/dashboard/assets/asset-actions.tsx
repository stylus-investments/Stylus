import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ArrowDown, ArrowUp, HandCoins, UserPlus } from 'lucide-react'
import React from 'react'

const AssetActions = () => {
    return (
        <div className='w-full flex items-center justify-between pt-3 text-muted-foreground sm:justify-center sm:gap-16 border-b pb-5'>
            <div className='flex flex-col gap-1.5 items-center'>
                <Button className='w-11 h-11 p-0 rounded-full' variant={'secondary'}>
                    <ArrowUp size={20} />
                </Button>
                <Label className='text-sm font-normal'>Send</Label>
            </div>
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
            <div className='flex flex-col gap-1.5 items-center'>
                <Button className='w-11 h-11 p-0 rounded-full' variant={'secondary'}>
                    <UserPlus size={20} />
                </Button>
                <Label className='text-sm font-normal'>Refer</Label>
            </div>
        </div>
    )
}

export default AssetActions