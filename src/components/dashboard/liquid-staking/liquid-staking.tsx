import React, { useEffect, useState } from 'react'
import { faLock, faFlag, faSackDollar, faCircleInfo, faHandHoldingDollar, faDollarSign, faPesoSign } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '../../ui/button'
import SnapshotTimer from './SnapshotTimer'
import BalanceHistory from './balance-history'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Label } from '@/components/ui/label'
import GuideAccordions from './guide-accordions'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import Image from 'next/image'
import { Separator } from '@/components/ui/separator'
import { caller } from '@/app/_trpc/server'
import Link from 'next/link'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import useBalanceStore from '@/state/balanceStore'
import { availableCurrencies } from '@/constant/availableCurrency'
interface Props {
    initialData: Awaited<ReturnType<(typeof caller['dashboard']['getDashboardData'])>>
}

const LiquidStaking = ({ initialData }: Props) => {

    const dashboardData = initialData.liquid_staking

    const { currency, setCurrency } = useBalanceStore()

    return (
        <div className='flex flex-col gap-10 w-full'>
            <div className='flex flex-col gap-5 xl:gap-10 xl:flex-row'>
                <div className='flex w-full gap-5 xl:w-1/2 flex-col md:flex-row'>
                    <Card className='w-full sm:w-96 md:w-1/2 xl:w-full'>
                        <CardHeader>
                            <div className='flex items-center w-full justify-between'>
                                <div className='font-normal'>Current Balance</div>
                                <div className='text-muted-foreground'>
                                    <Select value={currency} onValueChange={(value) => setCurrency(value)}>
                                        <SelectTrigger className='w-auto'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Currency</SelectLabel>
                                                {availableCurrencies.map((obj, i) => (
                                                    <SelectItem value={obj.currency} key={i} >
                                                        {obj.currency}
                                                        <FontAwesomeIcon icon={obj.icon} width={16} height={16} className='ml-2' />
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
                                    return (
                                        <div className='font-black text-2xl' key={i}>
                                            {(Number(obj.amount)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[0]}
                                            <span className='text-xs font-normal' >
                                                .{(Number(obj.amount)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[1]}
                                            </span>
                                            <span className='ml-2 text-lg'>{obj.currency}</span>
                                        </div>
                                    )
                                }
                            })}
                        </CardContent>
                    </Card>
                    <Card className='w-full sm:w-96 md:w-1/2 xl:w-full pt-6'>
                        <CardContent className='flex flex-col gap-3 justify-end'>
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
                        </CardContent>
                    </Card>
                </div>
                <ul className='flex flex-col sm:flex-row sm:gap-3 text-muted-foreground w-full md:w-auto lg:w-1/2 xl:items-end text-sm gap-3 order-1 md:order-2'>
                    <div className='flex items-center gap-3 w-full md:w-auto'>
                        <Button className='w-full h-9' variant={'ghost'}>
                            Deposit USDC
                        </Button>
                        <Link href={process.env.NEXT_PUBLIC_GRAPHENE_LINK as string} target='_blank' className='w-full'>
                            <Button className='w-full h-9' variant={'ghost'}>
                                Buy SAVE
                            </Button>
                        </Link>
                    </div>
                    <div className='flex items-center gap-3 w-full md:w-auto'>
                        <Button className='w-full h-9' variant={'ghost'}>
                            Transfer
                        </Button>
                        <Button className='w-full h-9' variant={'ghost'}>
                            Bond SAVE
                        </Button>
                    </div>
                </ul>
            </div>
            <div className='flex flex-col'>
                <div className='flex flex-col lg:flex-row w-full'>
                    <div className='flex flex-col gap-3 p-5 border rounded-t-lg lg:rounded-tr-none w-full'>
                        <div className='text-muted-foreground flex items-center justify-between gap-3'>
                            <div className='flex items-center gap-3'>
                                <FontAwesomeIcon icon={faLock} width={18} height={18} />
                                <Label>
                                    Global stake
                                </Label>
                            </div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger disabled>
                                        <FontAwesomeIcon icon={faCircleInfo} width={16} height={16} className='hover:text-muted-foreground text-muted' />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Total SAVE tokens currently staked across all accounts.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <h1 className='font-black md:text-lg '>
                            {(Number(dashboardData.global_stake)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[0]}
                            <span className='text-xs' >
                                .{(Number(dashboardData.global_stake)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[1]}
                            </span>
                            <span className='ml-2'>SAVE</span>
                        </h1>
                    </div>
                    <div className='flex flex-col gap-3 p-5 border w-full'>
                        <div className='text-muted-foreground flex items-center justify-between gap-3'>
                            <div className='flex items-center gap-3'>
                                <FontAwesomeIcon icon={faFlag} width={18} height={18} />
                                <Label>
                                    Next snapshot
                                </Label>
                            </div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger disabled>
                                        <FontAwesomeIcon icon={faCircleInfo} width={16} height={16} className='hover:text-muted-foreground text-muted' />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Scheduled time for the next snapshot to calculate rewards.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <h1 className='font-black md:text-lg '>
                            {
                                new Date(dashboardData.snapshot.next_snapshot).toLocaleString('en-US', {
                                    timeZone: 'UTC',
                                    weekday: 'short',
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })
                            }  UTC
                        </h1>
                    </div>
                    <SnapshotTimer nextSnapshot={dashboardData.snapshot.next_snapshot} />
                </div>
                <div className='flex w-full flex-col lg:flex-row'>
                    <div className='flex flex-col gap-3 p-5 border w-full lg:rounded-bl-lg'>
                        <div className='text-muted-foreground flex items-center justify-between gap-3'>
                            <div className='flex items-center gap-3'>
                                <FontAwesomeIcon icon={faLock} width={18} height={18} />
                                <Label>
                                    Your stake
                                </Label>
                                {dashboardData.snapshot.status === 1 && < Button className='h-6 bg-green-500 hover:bg-green-500 '>
                                    Active
                                </Button>
                                }
                                {!dashboardData.snapshot.status && <Button variant={'destructive'} className='h-6 '>
                                    Forfeited
                                </Button>}
                            </div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger disabled>
                                        <FontAwesomeIcon icon={faCircleInfo} width={16} height={16} className='hover:text-muted-foreground text-muted' />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Your active stake in SAVE tokens as recorded in the last snapshot.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <h1 className='font-black md:text-lg '>
                            {(Number(dashboardData.snapshot.current_stake)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[0]}
                            <span className='text-xs' >
                                .{(Number(dashboardData.snapshot.current_stake)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[1]}
                            </span>
                            <span className='ml-2'>SAVE</span>
                        </h1>
                        <small className='text-muted-foreground'>Last snapshot balance</small>
                    </div>
                    <div className='flex flex-col gap-3 p-5 border w-full'>
                        <div className='text-muted-foreground flex items-center justify-between gap-3'>
                            <div className='flex items-center gap-3'>
                                <FontAwesomeIcon icon={faSackDollar} width={18} height={18} />
                                <Label>
                                    Current Balance
                                </Label>
                                {Number(dashboardData.current_save_balance) > 0 && <Button className=' h-6 bg-orange-400  hover:bg-orange-400 text-white'>Holding</Button>}
                            </div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger disabled>
                                        <FontAwesomeIcon icon={faCircleInfo} width={16} height={16} className='hover:text-muted-foreground text-muted' />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Current amount of SAVE tokens in your crypto wallet.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <h1 className='font-black md:text-lg '>
                            {(Number(dashboardData.current_save_balance)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[0]}
                            <span className='text-xs' >
                                .{(Number(dashboardData.current_save_balance)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[1]}
                            </span>
                            <span className='ml-2'>SAVE</span>
                        </h1>
                        <small className='text-muted-foreground'>Crypto wallet holdings</small>
                    </div>
                    <div className='flex flex-col gap-3 w-full p-5 border rounded-b-lg lg:rounded-bl-none'>
                        <div className='text-muted-foreground flex items-center justify-between gap-3'>
                            <Label className='flex items-center gap-3'>
                                <FontAwesomeIcon icon={faHandHoldingDollar} width={18} height={18} />
                                Upcoming Rewards
                            </Label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger disabled>
                                        <FontAwesomeIcon icon={faCircleInfo} width={16} height={16} className='hover:text-muted-foreground text-muted' />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Expected $GROW tokens you will earn after this epoch ends.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className='w-full flex items-center justify-between'>
                            <h1 className='font-black md:text-lg '>
                                {(Number(dashboardData.snapshot.reward)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[0]}
                                <span className='text-xs' >
                                    .{(Number(dashboardData.snapshot.reward)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[1]}
                                </span>
                                <span className='ml-2'>$GROW</span>
                            </h1>
                        </div>
                        <small className='text-muted-foreground'>Epoch rewards expected</small>
                    </div>
                </div>
            </div>
            <BalanceHistory address={dashboardData.wallet} />
            <GuideAccordions />
        </div>
    )
}


export default LiquidStaking