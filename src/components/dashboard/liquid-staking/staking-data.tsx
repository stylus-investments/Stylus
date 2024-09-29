'use client'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { faLock, faFlag, faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import SnapshotTimer from './SnapshotTimer'
import { trpc } from '@/app/_trpc/client'
import { Button } from '@/components/ui/button'

const StakingData = () => {

    const { data: snapshot } = trpc.dashboard.getStakingData.useQuery()
    if (!snapshot) return null

    return (
        <div className='flex flex-col'>
            <div className='flex flex-col lg:flex-row w-full'>
                <div className='flex flex-col gap-3 p-5 border rounded-t-lg lg:rounded-br-none lg:rounded-bl-lg lg:rounded-tr-none w-full'>
                    <div className='text-muted-foreground flex items-center justify-between gap-3'>
                        <div className='flex items-center gap-3'>
                            <FontAwesomeIcon icon={faLock} width={18} height={18} />
                            <Label>
                                Your stake
                            </Label>
                            {snapshot.status === 1 && < Button className='h-6 bg-green-500 hover:bg-green-500 '>
                                Active
                            </Button>
                            }
                            {!snapshot.status && <Button variant={'destructive'} className='h-6 '>
                                Forfeited
                            </Button>}
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger disabled>
                                    <FontAwesomeIcon icon={faCircleInfo} width={16} height={16} className='hover:text-muted-foreground text-muted' />
                                </TooltipTrigger>
                                <TooltipContent>
                                    Your active stake in sBTC & sAVE tokens as recorded in the last snapshot.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className='w-full flex items-center gap-5'>
                        <h1 className='font-black md:text-lg '>
                            <span className='mr-2'>sBTC</span>
                            {(Number(snapshot.stake.sBTC)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[0]}
                            <span className='text-xs' >
                                .{(Number(snapshot.stake.sBTC)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[1]}
                            </span>
                        </h1>
                        <h1 className='font-black md:text-lg '>
                            <span className='mr-2'>sAVE</span>
                            {(Number(snapshot.stake.sAVE)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[0]}
                            <span className='text-xs' >
                                .{(Number(snapshot.stake.sAVE)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).split('.')[1]}
                            </span>
                        </h1>
                    </div>
                    <small className='text-muted-foreground'>Last snapshot balance</small>
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
                            new Date(snapshot.next_snapshot).toLocaleString('en-US', {
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
                <SnapshotTimer nextSnapshot={snapshot.next_snapshot} />
            </div>
        </div>
    )
}

export default StakingData