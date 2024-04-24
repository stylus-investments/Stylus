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
        <Card>
            <CardContent className="flex flex-col p-5 h-full">
                <div className='flex items-center gap-5 pb-5 w-full'>
                    <div className='flex flex-col gap-3 w-1/4'>
                        <div className='text-muted-foreground flex items-center gap-3'>
                            <FontAwesomeIcon icon={faLock} width={18} height={18} />
                            Global stake
                        </div>
                        <h1 className='font-black text-xl'>{(Number(dashboardData.global_stake)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $GO</h1>
                    </div>
                    <Separator orientation='vertical' className='h-24 ml-1' />
                    <div className='flex flex-col gap-3 w-1/4'>
                        <div className='text-muted-foreground flex items-center gap-3'>
                            <FontAwesomeIcon icon={faFlag} width={18} height={18} />
                            Next snapshot
                        </div>
                        <h1 className='font-black text-xl'>
                            {new Date(dashboardData.snapshot_date.next).toLocaleString('en-US', {
                                weekday: 'short', // abbreviated day of the week (e.g., Tue)
                                day: '2-digit', // 2-digit day of the month (e.g., 30)
                                month: 'short', // abbreviated month name (e.g., Apr)
                                year: 'numeric', // 4-digit year (e.g., 2024)
                                hour: '2-digit', // 2-digit hour (e.g., 11)
                                minute: '2-digit', // 2-digit minute (e.g., 00)
                                second: '2-digit', // 2-digit second (e.g., 00)
                            })}
                        </h1>
                    </div>
                    <Separator orientation='vertical' className='h-24 ml-1' />
                    <Timer nextSnapshot={dashboardData.snapshot_date.next} />
                </div>
                <Separator />
                <div className='flex items-center gap-10 py-5 w-full'>
                    <div className='flex flex-col gap-3 w-1/4'>
                        <div className='text-muted-foreground flex items-center gap-3'>
                            <FontAwesomeIcon icon={faLock} width={18} height={18} />
                            <div>
                                Your stake
                            </div>
                            {Number(dashboardData.user.current_go_balance) > 0 && <Button className='rounded-2xl h-7 bg-orange-400 text-foreground hover:bg-orange-400'>
                                Holding
                            </Button>}
                            {dashboardData.user.snapshot.status === 1 && < Button className='h-7 rounded-2xl bg-green-500 hover:bg-green-500'>
                                Active
                            </Button>
                            }
                            {!dashboardData.user.snapshot.status && <Button variant={'destructive'} className='h-7 rounded-2xl'>
                                Forfeited
                            </Button>}
                        </div>
                        <h1 className='font-black text-xl'>{(Number(dashboardData.user.snapshot.current_stake)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $GO</h1>
                        <small className='text-muted-foreground'>Snapshot balance</small>
                    </div>
                    <Separator orientation='vertical' className='h-24' />
                    <div className='flex flex-col gap-3 w-1/4'>
                        <div className='text-muted-foreground flex items-center gap-3'>
                            <FontAwesomeIcon icon={faSackDollar} width={18} height={18} />
                            Current Balance
                        </div>
                        <h1 className='font-black text-xl'>
                            <h1 className='font-black text-xl'>{(Number(dashboardData.user.current_go_balance)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $GO</h1>
                        </h1>
                        <small className='text-muted-foreground'>Claimed and unclaimed</small>
                    </div>
                    <div className='flex flex-col gap-3 w-1/2 bg-muted p-4'>
                        <div className='text-muted-foreground flex items-center gap-3'>
                            <FontAwesomeIcon icon={faSackDollar} width={18} height={18} />
                            Upcoming Rewards
                        </div>
                        <div className='w-full flex items-center justify-between'>
                            <h1 className='font-black text-xl'>{(Number(dashboardData.user.snapshot.reward)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $GROW</h1>
                        </div>
                        <small className='text-muted-foreground'>Compounding in your stake</small>
                    </div>
                </div>
            </CardContent>
        </Card >
    )
}


export default LiquidStaking