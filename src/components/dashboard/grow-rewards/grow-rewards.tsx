import React from 'react'

import SnapshotHistory from './snapshot-history';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { faLock, faCircleInfo, faSackDollar, faPercentage, faHandHoldingDollar, faMoneyBillTrendUp } from '@fortawesome/free-solid-svg-icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface GrowRewardsProps {
    dashboardData: {
        wallet: string
    }
}

const GrowRewards: React.FC<GrowRewardsProps> = ({ dashboardData }) => {

    return (
        <div className='flex flex-col gap-10'>
            <div className='flex flex-col'>
                <div className='flex flex-col lg:flex-row w-full'>
                    <div className='flex flex-col gap-3 p-5 border rounded-t-lg lg:rounded-tr-none w-full'>
                        <div className='text-muted-foreground flex items-center justify-between gap-3'>
                            <div className='flex items-center gap-3'>
                                <FontAwesomeIcon icon={faSackDollar} width={18} height={18} />
                                <Label>
                                    Current $Grow Balance
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
                            -
                            <span className='text-xs' >
                                -
                            </span>
                            <span className='ml-2'>$GO</span>
                        </h1>
                    </div>
                    <div className='flex flex-col gap-3 p-5 border w-full'>
                        <div className='text-muted-foreground flex items-center justify-between gap-3'>
                            <div className='flex items-center gap-3'>
                                <FontAwesomeIcon icon={faHandHoldingDollar} width={18} height={18} />
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
                            -
                        </h1>
                    </div>
                    <div className='flex flex-col gap-3 p-5 border lg:rounded-tr-lg w-full'>
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
                            -
                        </h1>
                    </div>                </div>
                <div className='flex w-full flex-col lg:flex-row'>
                    <div className='flex flex-col gap-3 p-5 border w-full lg:rounded-bl-lg'>
                        <div className='text-muted-foreground flex items-center justify-between gap-3'>
                            <div className='flex items-center gap-3'>
                                <FontAwesomeIcon icon={faLock} width={18} height={18} />
                                <Label>
                                    Your stake
                                </Label>
                                {< Button className='h-6 bg-green-500 hover:bg-green-500 '>
                                    Active
                                </Button>
                                }
                                {<Button variant={'destructive'} className='h-6 '>
                                    Forfeited
                                </Button>}
                            </div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger disabled>
                                        <FontAwesomeIcon icon={faCircleInfo} width={16} height={16} className='hover:text-muted-foreground text-muted' />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Your active stake in $GO tokens as recorded in the last snapshot.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <h1 className='font-black md:text-lg '>
                            -
                            <span className='text-xs' >
                                -
                            </span>
                            <span className='ml-2'>$GO</span>
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
                                -
                            </div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger disabled>
                                        <FontAwesomeIcon icon={faCircleInfo} width={16} height={16} className='hover:text-muted-foreground text-muted' />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Current amount of $GO tokens in your crypto wallet.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <h1 className='font-black md:text-lg '>
                            -
                            <span className='text-xs' >
                                -
                            </span>
                            <span className='ml-2'>$GO</span>
                        </h1>
                        <small className='text-muted-foreground'>Crypto wallet holdings</small>
                    </div>
                    <div className='flex flex-col gap-3 w-full p-5 border rounded-b-lg lg:rounded-bl-none'>
                        <div className='text-muted-foreground flex items-center justify-between gap-3'>
                            <Label className='flex items-center gap-3'>
                                <FontAwesomeIcon icon={faSackDollar} width={18} height={18} />
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
                                -
                                <span className='text-xs' >
                                    -
                                </span>
                                <span className='ml-2'>$GROW</span>
                            </h1>
                        </div>
                        <small className='text-muted-foreground'>Epoch rewards expected</small>
                    </div>
                </div>
            </div>
            <SnapshotHistory wallet={dashboardData.wallet} />
        </div>
    )
}

export default GrowRewards