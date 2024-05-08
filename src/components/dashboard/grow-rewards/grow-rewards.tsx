import React from 'react'

import SnapshotHistory from './snapshot-history';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Label } from '@/components/ui/label';
import { faCircleInfo, faSackDollar, faHandHoldingDollar, faMoneyBillTrendUp, faCoins } from '@fortawesome/free-solid-svg-icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface GrowRewardsProps {
    dashboardData: {
        wallet: string;
        current_grow_balance: string;
        upcoming_reward: string;
        total_reward_received: string;
    }
}

const GrowRewards: React.FC<GrowRewardsProps> = ({ dashboardData }) => {

    return (
        <div className='flex flex-col gap-10'>
            <div className='flex flex-col'>
                <div className='flex flex-col lg:flex-row w-full'>
                    <div className='flex flex-col gap-3 p-5 border rounded-t-lg rounded-b-lg lg:rounded-br-none lg:rounded-tr-none w-full'>
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
                                        Total $GO tokens currently staked across all accounts.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <h1 className='font-black md:text-lg '>
                            {(Number(dashboardData.current_grow_balance)).toLocaleString('en-US', { minimumFractionDigits: 10, maximumFractionDigits: 10 }).split('.')[0]}
                            <span className='text-xs' >
                                .{(Number(dashboardData.current_grow_balance)).toLocaleString('en-US', { minimumFractionDigits: 10, maximumFractionDigits: 10 }).split('.')[1]}
                            </span>
                            <span className='ml-2'>$GROW</span>
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
                                        Scheduled time for the next snapshot to calculate rewards.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <h1 className='font-black md:text-lg '>
                            {(Number(dashboardData.total_reward_received)).toLocaleString('en-US', { minimumFractionDigits: 10, maximumFractionDigits: 10 }).split('.')[0]}
                            <span className='text-xs' >
                                .{(Number(dashboardData.total_reward_received)).toLocaleString('en-US', { minimumFractionDigits: 10, maximumFractionDigits: 10 }).split('.')[1]}
                            </span>
                            <span className='ml-2'>$GROW</span>

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
                                        Countdown until the next snapshot for rewards.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <h1 className='font-black md:text-lg xl:text-xl'>
                            {(Number(dashboardData.upcoming_reward)).toLocaleString('en-US', { minimumFractionDigits: 10, maximumFractionDigits: 10 }).split('.')[0]}
                            <span className='text-xs' >
                                .{(Number(dashboardData.upcoming_reward)).toLocaleString('en-US', { minimumFractionDigits: 10, maximumFractionDigits: 10 }).split('.')[1]}
                            </span>
                            <span className='ml-2'>$GROW</span>
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
                                        Countdown until the next snapshot for rewards.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <h1 className='font-black md:text-lg xl:text-xl'>
                            0.5 %
                        </h1>
                    </div>
                </div>

            </div>
            <SnapshotHistory wallet={dashboardData.wallet} />
        </div>
    )
}

export default GrowRewards