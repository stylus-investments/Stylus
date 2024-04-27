import React from 'react'
import { faLock, faFlag, faSackDollar } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '../../ui/button'
import SnapshotTimer from './SnapshotTimer'
import BalanceHistory from './balance-history'

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
        balance_history: {
            id: string;
            type: string;
            month: number
            date: string;
            amount: string;
        }[];
        global_stake?: any;
    }
}


const LiquidStaking = ({ dashboardData }: Props) => {

    return (
        <div className='flex flex-col gap-10'>
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
                    <SnapshotTimer nextSnapshot={dashboardData.snapshot_date.next} />
                </div>
                <div className='flex w-full flex-col lg:flex-row'>
                    <div className='flex flex-col gap-3 p-5 border w-full'>
                        <div className='text-muted-foreground flex items-center gap-3'>
                            <FontAwesomeIcon icon={faLock} width={18} height={18} />
                            <div>
                                Your stake
                            </div>
                            {dashboardData.user.snapshot.status === 1 && < Button className='h-7 bg-green-500 hover:bg-green-500 rounded-3xl'>
                                Active
                            </Button>
                            }
                            {!dashboardData.user.snapshot.status && <Button variant={'destructive'} className='h-7 rounded-3xl'>
                                Forfeited
                            </Button>}
                        </div>
                        <h1 className='font-black sm:text-lg md:text-xl'>{(Number(dashboardData.user.snapshot.current_stake)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $GO</h1>
                        <small className='text-muted-foreground'>Last snapshot balance</small>
                    </div>
                    <div className='flex flex-col gap-3 p-5 border w-full'>
                        <div className='text-muted-foreground flex items-center gap-3'>
                            <FontAwesomeIcon icon={faSackDollar} width={18} height={18} />
                            <div>
                                Current Balance
                            </div>
                            {Number(dashboardData.user.current_go_balance) > 0 && <Button className=' h-8 bg-orange-400 rounded-3xl hover:bg-orange-400 text-white'>Holding</Button>}
                        </div>
                        <h1 className='font-black sm:text-lg md:text-xl'>
                            <h1 className='font-black sm:text-lg md:text-xl'>{(Number(dashboardData.user.current_go_balance)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $GO</h1>
                        </h1>
                        <small className='text-muted-foreground'>Crypto wallet holdings</small>
                    </div>
                    <div className='flex flex-col gap-3 w-full p-5 border bg-muted'>
                        <div className='text-muted-foreground flex items-center gap-3'>
                            <FontAwesomeIcon icon={faSackDollar} width={18} height={18} />
                            Upcoming Rewards
                        </div>
                        <div className='w-full flex items-center justify-between'>
                            <h1 className='font-black sm:text-lg md:text-xl'>{(Number(dashboardData.user.snapshot.reward)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $GROW</h1>
                        </div>
                        <small className='text-muted-foreground'>Epoch rewards expected</small>
                    </div>
                </div>
            </div>
            <BalanceHistory history={dashboardData.balance_history} />
        </div>
    )
}


export default LiquidStaking