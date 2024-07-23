import { caller } from '@/app/_trpc/server'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { faLock, faFlag, faSackDollar, faCircleInfo, faHandHoldingDollar, faDollarSign, faPesoSign } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import SnapshotTimer from './SnapshotTimer'
import { Button } from '@/components/ui/button'

const StakingData = ({ initialData }: {
    initialData: Awaited<ReturnType<(typeof caller['dashboard']['getDashboardData'])>>

}) => {

    const dashboardData = initialData.liquid_staking

    return (
        <div className='flex flex-col padding'>
            <div className='flex flex-col lg:flex-row w-full'>
                <div className='flex flex-col gap-3 p-5 border rounded-t-lg rounded-b-lg lg:rounded-br-none lg:rounded-tr-none w-full'>
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
                                Bonded Balance
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
                    <h1 className='font-black md:text-lg'>
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
        </div>
    )
}

export default StakingData