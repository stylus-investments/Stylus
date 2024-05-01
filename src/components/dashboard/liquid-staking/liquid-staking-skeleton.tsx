import { Skeleton } from '@/components/ui/skeleton'
import { faClock, faFlag, faLock, faSackDollar } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import BalanceHistorySkeleton from './balance-history-skeleton'

const LiquidStakingSkeleton = () => {
    return (
        <div className='flex flex-col gap-10'>
            <div className='border flex flex-col'>
                <div className='flex flex-col lg:flex-row w-full'>
                    <div className='flex flex-col gap-3 p-5 border w-full'>
                        <div className='text-muted-foreground flex items-center gap-3'>
                            <FontAwesomeIcon icon={faLock} width={18} height={18} />
                            Global stake
                        </div>
                        <Skeleton className='w-44 h-6 rounded-3xl' />
                    </div>
                    <div className='flex flex-col gap-3 p-5 border w-full'>
                        <div className='text-muted-foreground flex items-center gap-3'>
                            <FontAwesomeIcon icon={faFlag} width={18} height={18} />
                            Next snapshot
                        </div>
                        <h1 className='font-black text-lg'>
                            <Skeleton className='w-72 h-6 rounded-3xl' />
                        </h1>
                    </div>
                    <div className='flex flex-col gap-3 p-5 bg-muted border w-full'>
                        <div className='text-muted-foreground flex items-center gap-3'>
                            <FontAwesomeIcon icon={faClock} width={18} height={18} />
                            Timer
                        </div>
                        <h1 className='font-black text-xl'>
                            -
                        </h1>
                    </div>
                </div>
                <div className='flex w-full flex-col lg:flex-row'>
                    <div className='flex flex-col gap-3 p-5 border w-full'>
                        <div className='text-muted-foreground flex items-center gap-3'>
                            <FontAwesomeIcon icon={faLock} width={18} height={18} />
                            <div>
                                Your stake
                            </div>
                        </div>
                        <Skeleton className='w-52 h-6 rounded-3xl' />
                        <small className='text-muted-foreground'>Last snapshot balance</small>
                    </div>
                    <div className='flex flex-col gap-3 p-5 border w-full'>
                        <div className='text-muted-foreground flex items-center gap-3'>
                            <FontAwesomeIcon icon={faSackDollar} width={18} height={18} />
                            <div>Current Balance</div>
                        </div>
                        <h1 className='font-black sm:text-lg md:text-xl'>
                            <Skeleton className='w-64 h-6 rounded-3xl' />
                        </h1>
                        <small className='text-muted-foreground'>Crypto wallet holdings</small>
                    </div>
                    <div className='flex flex-col gap-3 w-full p-5 border bg-muted'>
                        <div className='text-muted-foreground flex items-center gap-3'>
                            <FontAwesomeIcon icon={faSackDollar} width={18} height={18} />
                            Upcoming Rewards
                        </div>
                        <div className='w-full flex items-center justify-between'>
                            -
                        </div>
                        <small className='text-muted-foreground'>Epoch rewards expected</small>
                    </div>
                </div>
            </div>
            <BalanceHistorySkeleton />
        </div>)
}

export default LiquidStakingSkeleton