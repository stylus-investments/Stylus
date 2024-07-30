'use client'
import React, { useState } from 'react'
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
import { Eye, EyeOff, FileClock, RefreshCcw } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { signOut, useSession } from 'next-auth/react'


const BalancesHeader = ({ initialData }: {
    initialData: Awaited<ReturnType<(typeof caller['dashboard']['getDashboardData'])>>

}) => {

    const session = useSession({
        required: true,
        onUnauthenticated: () => {
            signOut({
                redirect: true,
                callbackUrl: '/connect'
            })
        }
    })

    const dashboardData = initialData.liquid_staking

    const [showBalance, setShowBalance] = useState(true)

    const { currency, setCurrency } = useBalanceStore()

    return (
        <div className='flex flex-col gap-5 lg:pt-10 padding'>
            <div className='flex flex-col items-center w-full gap-2'>
                <div className='flex items-center text-muted-foreground gap-3'>
                    <Label className='font-normal'>
                        Total Balance
                    </Label>
                    <div className='cursor-pointer' onClick={() => setShowBalance(prev => !prev)}>
                        {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
                    </div>
                </div>
                {dashboardData.currentBalances.map((obj, i) => {
                    if (obj.currency === currency) {
                        // Find the matching currency object
                        const matchingCurrency = availableCurrencies.find(currency => currency.currency === obj.currency);
                        return (
                            <div className='font-medium text-4xl flex items-center justify-between' key={i}>
                                {showBalance ? <div className='flex items-center'>
                                    {matchingCurrency && (
                                        <FontAwesomeIcon icon={matchingCurrency.icon} width={30} height={30} />
                                    )}
                                    <div>
                                        {(Number(obj.amount)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div> : <div>********</div>}
                            </div>
                        );
                    }
                })}
            </div>
            <div className='flex items-center self-center w-full xl:w-80 sm:gap-5 gap-5'>
                <Button className='w-full'>
                    Deposit
                </Button>
                <Link href={process.env.NEXT_PUBLIC_GRAPHENE_LINK as string} target='_blank' className='w-full'>
                    <Button className='w-full'>
                        Swap
                    </Button>
                </Link>
            </div>
        </div >
    )
}

export default BalancesHeader