'use client'
import React from 'react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { availableCurrencies } from '@/constant/availableCurrency'
import TransferSave from './transfer-save'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '../../ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { Separator } from '@/components/ui/separator'
import useBalanceStore from '@/state/balanceStore'
import { caller } from '@/app/_trpc/server'
import SaveNow from './save-now/save-now'
import { useAccount } from 'wagmi'

const BalancesHeader = ({ initialData }: {
    initialData: Awaited<ReturnType<(typeof caller['dashboard']['getDashboardData'])>>

}) => {

    const dashboardData = initialData.liquid_staking

    const { currency, setCurrency } = useBalanceStore()

    return (
        <div className='flex flex-col gap-5 xl:gap-10 xl:flex-row'>
            <div className='flex w-full gap-5 xl:w-1/2 flex-col md:flex-row'>
                <Card className='w-full sm:w-96 md:w-1/2 xl:w-full'>
                    <CardHeader>
                        <div className='flex items-center w-full justify-between'>
                            <div className='font-normal'>Current Balance</div>
                            <div className='text-muted-foreground'>
                                <Select value={currency} onValueChange={(value) => setCurrency(value)}>
                                    <SelectTrigger className='w-20'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Currency</SelectLabel>
                                            {availableCurrencies.map((obj, i) => (
                                                <SelectItem value={obj.currency} key={i} >
                                                    {obj.currency}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className='flex flex-col'>
                        {dashboardData.currentBalances.map((obj, i) => {
                            if (obj.currency === currency) {
                                // Find the matching currency object
                                const matchingCurrency = availableCurrencies.find(currency => currency.currency === obj.currency);
                                return (
                                    <div className='font-black text-2xl flex items-center justify-between' key={i}>
                                        <div>
                                            {(Number(obj.amount)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[0]}
                                            <span className='text-xs font-normal' >
                                                .{(Number(obj.amount)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[1]}
                                            </span>
                                        </div>
                                        {/* Render the icon if a matching currency is found */}
                                        {matchingCurrency && (
                                            <FontAwesomeIcon icon={matchingCurrency.icon} width={16} height={16} className='text-base text-muted-foreground' />
                                        )}
                                    </div>
                                );
                            }
                        })}
                    </CardContent>
                </Card>
                <div className='w-full sm:w-96 md:w-1/2 xl:w-full p-6 rounded-md flex flex-col gap-3 justify-center border' >
                    <div className='flex gap-3 items-center text-center w-full'>
                        <Image width={25} height={25} className='h-auto rounded-full' alt='Go' src={'/save.webp'} />
                        <h1 className='font-black text-lg'>
                            {(Number(dashboardData.current_save_balance)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[0]}
                            <span className='text-xs font-normal' >
                                .{(Number(dashboardData.current_save_balance)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[1]}
                            </span>
                            <span className='ml-2 text-lg'>SAVE</span>
                        </h1>
                    </div>
                    <Separator />
                    <div className='flex gap-3 items-center text-center w-full'>
                        <Image width={25} height={25} className='h-auto rounded-full' alt='Go' src={'/usdc.png'} />
                        <h1 className='font-black text-lg'>
                            {(Number(dashboardData.current_usdc_balance)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[0]}
                            <span className='text-xs font-normal' >
                                .{(Number(initialData.liquid_staking.current_usdc_balance)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[1]}
                            </span>
                            <span className='ml-2 text-lg'>USDC</span>
                        </h1>
                    </div>
                </div>
            </div>
            <ul className='flex flex-col sm:flex-row sm:gap-3 text-muted-foreground w-full md:w-auto lg:w-1/2 xl:items-end text-sm gap-3 order-1 md:order-2'>
                <div className='flex items-center gap-3 w-full md:w-auto'>
                    <SaveNow />
                    <Link href={process.env.NEXT_PUBLIC_GRAPHENE_LINK as string} target='_blank' className='w-full'>
                        <Button className='w-full h-9'>
                            Swap SAVE
                        </Button>
                    </Link>
                </div>
                <div className='flex items-center gap-3 w-full md:w-auto'>
                    <TransferSave />
                    <Button className='w-full h-9'>
                        Bond SAVE
                    </Button>
                </div>
            </ul>
        </div>
    )
}

export default BalancesHeader