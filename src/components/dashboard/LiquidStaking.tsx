import React from 'react'
import { Card, CardContent } from '../ui/card'
import { faLock, faFlag, faSackDollar } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import Timer from './SnapshotTimer'

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
        snapshot_date: {
            next: string;
            start: string;
        };
        global_stake?: any;
    }
}


const LiquidStaking = ({ dashboardData }: Props) => {

    return (
        <>
            <div className='border flex flex-col'>
                <div className='flex flex-col lg:flex-row w-full'>
                    <div className='flex flex-col gap-3 p-5 border w-full'>
                        <div className='text-muted-foreground flex items-center gap-3'>
                            <FontAwesomeIcon icon={faLock} width={18} height={18} />
                            Global stake
                        </div>
                        <h1 className='font-black sm:text-lg md:text-xl'>{(Number(dashboardData.global_stake)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $GO</h1>
                    </div>
                    <div className='flex flex-col gap-3 p-5 border w-full'>
                        <div className='text-muted-foreground flex items-center gap-3'>
                            <FontAwesomeIcon icon={faFlag} width={18} height={18} />
                            Next snapshot
                        </div>
                        <h1 className='font-black text-lg'>
                            {
                                new Date(dashboardData.snapshot_date.next).toLocaleString('en-US', {
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
                    <Timer nextSnapshot={dashboardData.snapshot_date.next} />
                </div>
                <div className='flex w-full flex-col lg:flex-row'>
                    <div className='flex flex-col gap-3 p-5 border w-full'>
                        <div className='text-muted-foreground flex items-center gap-3'>
                            <FontAwesomeIcon icon={faLock} width={18} height={18} />
                            <div>
                                Your stake
                            </div>
                            {dashboardData.user.snapshot.status === 1 && < Button className='h-7 bg-green-500 hover:bg-green-500'>
                                Active
                            </Button>
                            }
                            {!dashboardData.user.snapshot.status && <Button variant={'destructive'} className='h-7'>
                                Forfeited
                            </Button>}
                        </div>
                        <h1 className='font-black sm:text-lg md:text-xl'>{(Number(dashboardData.user.snapshot.current_stake)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $GO</h1>
                        <small className='text-muted-foreground'>Snapshot balance</small>
                    </div>
                    <div className='flex flex-col gap-3 p-5 border w-full'>
                        <div className='text-muted-foreground flex items-center gap-3'>
                            <FontAwesomeIcon icon={faSackDollar} width={18} height={18} />
                            Current Balance
                        </div>
                        <h1 className='font-black sm:text-lg md:text-xl'>
                            <h1 className='font-black sm:text-lg md:text-xl'>{(Number(dashboardData.user.current_go_balance)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $GO</h1>
                        </h1>
                        <small className='text-muted-foreground'>Claimed and unclaimed</small>
                    </div>
                    <div className='flex flex-col gap-3 w-full p-5 border bg-muted'>
                        <div className='text-muted-foreground flex items-center gap-3'>
                            <FontAwesomeIcon icon={faSackDollar} width={18} height={18} />
                            Upcoming Rewards
                        </div>
                        <div className='w-full flex items-center justify-between'>
                            <h1 className='font-black sm:text-lg md:text-xl'>{(Number(dashboardData.user.snapshot.reward)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $GROW</h1>
                        </div>
                        <small className='text-muted-foreground'>Compounding in your stake</small>
                    </div>
                </div>
            </div>
        </>
    )
}


export default LiquidStaking