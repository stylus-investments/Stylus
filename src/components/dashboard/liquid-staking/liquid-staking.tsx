import React from 'react'
import { faLock, faFlag, faSackDollar, faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '../../ui/button'
import SnapshotTimer from './SnapshotTimer'
import BalanceHistory from './balance-history'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface Props {
    dashboardData: {
        user: {
            snapshot: {
                reward: string;
                status: number;
                current_stake: string;
            };
            wallet: string;
            current_go_balance: string;
        };
        next_snapshot: string;
        global_stake?: any;
    }
}

const LiquidStaking = ({ dashboardData }: Props) => {

    return (
        <div className='flex flex-col gap-10'>
            <div className='border flex flex-col'>
                <div className='flex flex-col lg:flex-row w-full'>
                    <div className='flex flex-col gap-3 p-5 border w-full'>
                        <div className='text-muted-foreground flex items-center justify-between gap-3'>
                            <div className='flex items-center gap-3'>
                                <FontAwesomeIcon icon={faLock} width={18} height={18} />
                                Global stake
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
                        <h1 className='font-black text-xl'>
                            {(Number(dashboardData.global_stake)).toLocaleString('en-US', { minimumFractionDigits: 10, maximumFractionDigits: 10 }).split('.')[0]}
                            <span className='text-sm' >
                                .{(Number(dashboardData.global_stake)).toLocaleString('en-US', { minimumFractionDigits: 10, maximumFractionDigits: 10 }).split('.')[1]}
                            </span>
                            <span className='ml-2'>$GO</span>
                        </h1>
                    </div>
                    <div className='flex flex-col gap-3 p-5 border w-full'>
                        <div className='text-muted-foreground flex items-center justify-between gap-3'>
                            <div className='flex items-center gap-3'>
                                <FontAwesomeIcon icon={faFlag} width={18} height={18} />
                                Next snapshot
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
                        <h1 className='font-black text-lg'>
                            {
                                new Date(dashboardData.next_snapshot).toLocaleString('en-US', {
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
                    <SnapshotTimer nextSnapshot={dashboardData.next_snapshot} />
                </div>
                <div className='flex w-full flex-col lg:flex-row'>
                    <div className='flex flex-col gap-3 p-5 border w-full'>
                        <div className='text-muted-foreground flex items-center justify-between gap-3'>
                            <div className='flex items-center gap-3'>
                                <FontAwesomeIcon icon={faLock} width={18} height={18} />
                                <div>
                                    Your stake
                                </div>
                                {dashboardData.user.snapshot.status === 1 && < Button className='h-6 bg-green-500 hover:bg-green-500 rounded-3xl'>
                                    Active
                                </Button>
                                }
                                {!dashboardData.user.snapshot.status && <Button variant={'destructive'} className='h-6 rounded-3xl'>
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
                        <h1 className='font-black text-xl'>
                            {(Number(dashboardData.user.snapshot.current_stake)).toLocaleString('en-US', { minimumFractionDigits: 10, maximumFractionDigits: 10 }).split('.')[0]}
                            <span className='text-sm' >
                                .{(Number(dashboardData.user.snapshot.current_stake)).toLocaleString('en-US', { minimumFractionDigits: 10, maximumFractionDigits: 10 }).split('.')[1]}
                            </span>
                            <span className='ml-2'>$GO</span>
                        </h1>
                        <small className='text-muted-foreground'>Last snapshot balance</small>
                    </div>
                    <div className='flex flex-col gap-3 p-5 border w-full'>
                        <div className='text-muted-foreground flex items-center justify-between gap-3'>
                            <div className='flex items-center gap-3'>
                                <FontAwesomeIcon icon={faSackDollar} width={18} height={18} />
                                <div>
                                    Current Balance
                                </div>
                                {Number(dashboardData.user.current_go_balance) > 0 && <Button className=' h-6 bg-orange-400 rounded-3xl hover:bg-orange-400 text-white'>Holding</Button>}
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
                        <h1 className='font-black text-xl'>
                            {(Number(dashboardData.user.current_go_balance)).toLocaleString('en-US', { minimumFractionDigits: 10, maximumFractionDigits: 10 }).split('.')[0]}
                            <span className='text-sm' >
                                .{(Number(dashboardData.user.current_go_balance)).toLocaleString('en-US', { minimumFractionDigits: 10, maximumFractionDigits: 10 }).split('.')[1]}
                            </span>
                            <span className='ml-2'>$GO</span>
                        </h1>
                        <small className='text-muted-foreground'>Crypto wallet holdings</small>
                    </div>
                    <div className='flex flex-col gap-3 w-full p-5 border'>
                        <div className='text-muted-foreground flex items-center justify-between gap-3'>
                            <div className='flex items-center gap-3'>
                                <FontAwesomeIcon icon={faSackDollar} width={18} height={18} />
                                Upcoming Rewards
                            </div>
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
                            <h1 className='font-black text-xl'>
                                {(Number(dashboardData.user.snapshot.reward)).toLocaleString('en-US', { minimumFractionDigits: 10, maximumFractionDigits: 10 }).split('.')[0]}
                                <span className='text-sm' >
                                    .{(Number(dashboardData.user.snapshot.reward)).toLocaleString('en-US', { minimumFractionDigits: 10, maximumFractionDigits: 10 }).split('.')[1]}
                                </span>
                                <span className='ml-2'>$GROW</span>
                            </h1>
                        </div>
                        <small className='text-muted-foreground'>Epoch rewards expected</small>
                    </div>
                </div>
            </div>
            <BalanceHistory address={dashboardData.user.wallet} />
        </div>
    )
}


export default LiquidStaking