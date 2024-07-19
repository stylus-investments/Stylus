import React, { useState } from 'react'
import BalanceHistory from './balance-history'
import GuideAccordions from './guide-accordions'
import { caller } from '@/app/_trpc/server'
import StakingData from './staking-data'
import BalancesHeader from './balances-header'
import OrderHistory from './order-history'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

interface Props {
    initialData: Awaited<ReturnType<(typeof caller['dashboard']['getDashboardData'])>>
}

const LiquidStaking = ({ initialData }: Props) => {

    const [balanceTable, setBalanceTable] = useState('2')

    return (
        <div className='flex flex-col gap-8 w-full'>
            <BalancesHeader initialData={initialData} />
            <div className='relative'>
                <Separator />
                <Label className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-5 bg-card lg:text-base">LIQUID STAKING</Label>
            </div>
            <StakingData initialData={initialData} />
            <div className='flex flex-col gap-5'>
                <div className='flex items-center gap-3'>
                    <Label>Show Table</Label>
                    <Separator orientation='vertical' className='h-7' />
                    <Select value={balanceTable} onValueChange={(value) => setBalanceTable(value)} >
                        <SelectTrigger className='w-44'>
                            <SelectValue placeholder={balanceTable === '1' ? 'Balance History' : 'Order History'} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">Save History</SelectItem>
                            <SelectItem value="2">Order History</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {balanceTable === '1' ?
                    <BalanceHistory /> :
                    <OrderHistory />
                }
            </div>
            <GuideAccordions />
        </div >
    )
}


export default LiquidStaking