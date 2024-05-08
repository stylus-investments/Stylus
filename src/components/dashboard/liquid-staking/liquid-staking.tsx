import React from 'react'
import { faLock, faFlag, faSackDollar, faCircleInfo, faHandHoldingDollar } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '../../ui/button'
import SnapshotTimer from './SnapshotTimer'
import BalanceHistory from './balance-history'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Label } from '@/components/ui/label'

interface Props {
    dashboardData: {
        snapshot: {
            status: number;
            reward: string;
            next_snapshot: string;
            current_stake: string;
        };
        wallet: string;
        current_go_balance: string;
        global_stake: string;
    }
}

const LiquidStaking = ({ dashboardData }: Props) => {

    return (
        <div className='flex flex-col gap-10'>
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
                                        Total $GO tokens currently staked across all accounts.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <h1 className='font-black md:text-lg '>
                            {(Number(dashboardData.global_stake)).toLocaleString('en-US', { minimumFractionDigits: 10, maximumFractionDigits: 10 }).split('.')[0]}
                            <span className='text-xs' >
                                .{(Number(dashboardData.global_stake)).toLocaleString('en-US', { minimumFractionDigits: 10, maximumFractionDigits: 10 }).split('.')[1]}
                            </span>
                            <span className='ml-2'>$GO</span>
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
                                        Your active stake in $GO tokens as recorded in the last snapshot.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <h1 className='font-black md:text-lg '>
                            {(Number(dashboardData.snapshot.current_stake)).toLocaleString('en-US', { minimumFractionDigits: 10, maximumFractionDigits: 10 }).split('.')[0]}
                            <span className='text-xs' >
                                .{(Number(dashboardData.snapshot.current_stake)).toLocaleString('en-US', { minimumFractionDigits: 10, maximumFractionDigits: 10 }).split('.')[1]}
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
                                {Number(dashboardData.current_go_balance) > 0 && <Button className=' h-6 bg-orange-400  hover:bg-orange-400 text-white'>Holding</Button>}
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
                            {(Number(dashboardData.current_go_balance)).toLocaleString('en-US', { minimumFractionDigits: 10, maximumFractionDigits: 10 }).split('.')[0]}
                            <span className='text-xs' >
                                .{(Number(dashboardData.current_go_balance)).toLocaleString('en-US', { minimumFractionDigits: 10, maximumFractionDigits: 10 }).split('.')[1]}
                            </span>
                            <span className='ml-2'>$GO</span>
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
                                {(Number(dashboardData.snapshot.reward)).toLocaleString('en-US', { minimumFractionDigits: 10, maximumFractionDigits: 10 }).split('.')[0]}
                                <span className='text-xs' >
                                    .{(Number(dashboardData.snapshot.reward)).toLocaleString('en-US', { minimumFractionDigits: 10, maximumFractionDigits: 10 }).split('.')[1]}
                                </span>
                                <span className='ml-2'>$GROW</span>
                            </h1>
                        </div>
                        <small className='text-muted-foreground'>Epoch rewards expected</small>
                    </div>
                </div>
            </div>
            <BalanceHistory address={dashboardData.wallet} />
        </div>
    )
}


export default LiquidStaking