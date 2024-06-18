import React from 'react'
import SnapshotHistory from './snapshot-history';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Label } from '@/components/ui/label';
import { faCircleInfo, faSackDollar, faHandHoldingDollar, faMoneyBillTrendUp, faCoins } from '@fortawesome/free-solid-svg-icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { caller } from '@/app/_trpc/server';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import useBalanceStore from '@/state/balanceStore';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { availableCurrencies } from '@/constant/availableCurrency';
interface GrowRewardsProps {
    initialData: Awaited<ReturnType<(typeof caller['dashboard']['getDashboardData'])>>
}

const GrowRewards: React.FC<GrowRewardsProps> = ({ initialData }) => {

    const dashboardData = initialData.grow_rewards
    const { currency, setCurrency } = useBalanceStore()

    return (
        <div className='flex flex-col gap-10'>
            <div className='flex flex-col gap-5 xl:gap-10 xl:flex-row'>
                <div className='flex w-full gap-5 xl:w-1/2 flex-col md:flex-row'>
                    <Card className='w-full sm:w-96 md:w-1/2 xl:w-full'>
                        <CardHeader>
                            <div className='flex items-center w-full justify-between'>
                                <div className='font-normal'>Rewards Accumulated</div>
                                <div className='text-muted-foreground'>
                                    <Select value={currency} onValueChange={(value) => setCurrency(value)}>
                                        <SelectTrigger className='w-auto'>
                                            <SelectValue placeholder={currency} />
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
                            {dashboardData.rewardsAccumulated.map((obj, i) => {
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
                    <Card className='w-full sm:w-96 md:w-1/2 xl:w-full pt-6'>
                        <CardContent className='flex flex-col gap-3 justify-end'>
                            <div className='flex gap-3 items-center text-center w-full'>
                                <Image width={25} height={25} className='h-auto rounded-full' alt='Go' src={'/save.webp'} />
                                <h1 className='font-black text-lg'>
                                    {(Number(initialData.grow_rewards.current_earn_balance)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[0]}
                                    <span className='text-xs font-normal' >
                                        .{(Number(initialData.grow_rewards.current_earn_balance)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[1]}
                                    </span>
                                    <span className='ml-2 text-lg'>EARN</span>
                                </h1>
                            </div>
                            <Separator />
                            <div className='flex gap-3 items-center text-center w-full'>
                                <Image width={25} height={25} className='h-auto rounded-full' alt='Go' src={'/save.webp'} />
                                <h1 className='font-black text-lg'>
                                    {(Number(initialData.grow_rewards.current_svn_balance)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[0]}
                                    <span className='text-xs font-normal' >
                                        .{(Number(initialData.grow_rewards.current_svn_balance)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[1]}
                                    </span>
                                    <span className='ml-2 text-lg'>SVN</span>
                                </h1>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <ul className='flex flex-col sm:flex-row sm:gap-3 text-muted-foreground w-full md:w-auto lg:w-1/2 xl:items-end text-sm gap-3 order-1 md:order-2'>
                    <div className='flex items-center gap-3 w-full md:w-auto'>
                        <Button className='w-full h-9'>
                            USDC Out
                        </Button>
                        <Button className='w-full h-9'>
                            Sell Earn
                        </Button>
                    </div>
                    <div className='flex items-center gap-3 w-full md:w-auto'>
                        <Button className='w-full h-9'>
                            Incubate
                        </Button>
                        <Button className='w-full h-9'>
                            IDO SVN
                        </Button>
                    </div>
                </ul>
            </div>
            <div className='flex flex-col'>
                <div className='flex flex-col lg:flex-row w-full'>
                    <div className='flex flex-col gap-3 p-5 border rounded-t-lg lg:rounded-br-none lg:rounded-tr-none w-full'>
                        <div className='text-muted-foreground flex items-center justify-between gap-3'>
                            <div className='flex items-center gap-3'>
                                <FontAwesomeIcon icon={faSackDollar} width={18} height={18} />
                                <Label>
                                    Current Balance
                                </Label>
                            </div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger disabled>
                                        <FontAwesomeIcon icon={faCircleInfo} width={16} height={16} className='hover:text-muted-foreground text-muted' />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Current EARN Balance.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <h1 className='font-black md:text-lg '>
                            {(Number(dashboardData.current_earn_balance)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[0]}
                            <span className='text-xs' >
                                .{(Number(dashboardData.current_earn_balance)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[1]}
                            </span>
                            <span className='ml-2'>EARN</span>
                        </h1>
                    </div>

                    <div className='flex flex-col gap-3 p-5 border w-full'>
                        <div className='text-muted-foreground flex items-center justify-between gap-3'>
                            <div className='flex items-center gap-3'>
                                <FontAwesomeIcon icon={faCoins} width={18} height={18} />
                                <Label>
                                    Total $Grow Received
                                </Label>
                            </div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger disabled>
                                        <FontAwesomeIcon icon={faCircleInfo} width={16} height={16} className='hover:text-muted-foreground text-muted' />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Total $Grow received rewards.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <h1 className='font-black md:text-lg '>
                            {(Number(dashboardData.total_reward_received)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[0]}
                            <span className='text-xs' >
                                .{(Number(dashboardData.total_reward_received)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[1]}
                            </span>
                            <span className='ml-2'>EARN</span>

                        </h1>
                    </div>
                    <div className='flex flex-col gap-3 p-5 border w-full'>
                        <div className='text-muted-foreground flex items-center justify-between gap-3'>
                            <div className="flex items-center gap-3">
                                <FontAwesomeIcon icon={faHandHoldingDollar} width={18} height={18} />
                                <Label>
                                    Upcoming Rewards
                                </Label>
                            </div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger disabled>
                                        <FontAwesomeIcon icon={faCircleInfo} width={16} height={16} className='text-muted hover:text-muted-foreground' />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Next snapshot $Grow expected rewards.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <h1 className='font-black md:text-lg xl:text-xl'>
                            {(Number(dashboardData.upcoming_reward)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[0]}
                            <span className='text-xs' >
                                .{(Number(dashboardData.upcoming_reward)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[1]}
                            </span>
                            <span className='ml-2'>EARN</span>
                        </h1>
                    </div>
                    <div className='flex flex-col gap-3 p-5 border rounded-b-lg lg:rounded-t-lg lg:rounded-tl-none lg:rounded-bl-none w-full'>
                        <div className='text-muted-foreground flex items-center justify-between gap-3'>
                            <div className="flex items-center gap-3">
                                <FontAwesomeIcon icon={faMoneyBillTrendUp} width={18} height={18} />
                                <Label>
                                    Current Yield Rate
                                </Label>
                            </div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger disabled>
                                        <FontAwesomeIcon icon={faCircleInfo} width={16} height={16} className='text-muted hover:text-muted-foreground' />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Current Yield Rate
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <h1 className='font-black md:text-lg xl:text-xl'>
                            10% APY
                        </h1>
                    </div>
                </div>

            </div>
            <SnapshotHistory wallet={initialData.liquid_staking.wallet} />
        </div>
    )
}

export default GrowRewards