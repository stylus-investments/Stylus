import React from 'react'
import { Skeleton } from '../ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDatabase, faGavel, faSeedling } from '@fortawesome/free-solid-svg-icons'
import GlowStaking from './glow-staking/glow-staking'
import LiquidStakingSkeleton from './liquid-staking/liquid-staking-skeleton'
import Link from 'next/link'
import { Button } from '../ui/button'
import Image from 'next/image'
import GrowRewardsSkeleton from './grow-rewards/grow-rewards-skeleton'

const DashboardSkeleton = () => {
    return (
        <main className='container flex flex-col items-center pt-32 pb-10 gap-10'>

            <div className='flex flex-col gap-3 items-center text-center'>
                <Image width={100} height={50} className='h-auto rounded-full' alt='Coin' src={'/go.jpeg'} />
                <Skeleton className='h-8 rounded-2xl w-44' />
                <h1 className='text-muted-foreground'>Total balance in your wallet</h1>
                <Link href={process.env.NEXT_PUBLIC_GRAPHENE_LINK as string} target='_blank'>
                    <Button className='h-8 rounded-3xl bg-green-500 hover:bg-green-500'>
                        Add More $GO
                    </Button>
                </Link>
            </div>
            <Tabs defaultValue="go" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-10">
                    <TabsTrigger value="go">
                        <div className='flex items-center gap-2'>
                            <FontAwesomeIcon icon={faDatabase} width={18} height={18} className='text-primary' />
                            <div className='hidden md:flex'>
                                LIQUID STAKING
                            </div>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value="grow">
                        <div className='flex items-center gap-2'>
                            <FontAwesomeIcon icon={faSeedling} width={18} height={18} className='text-primary' />
                            <div className='hidden md:flex'>
                                GROW REWARDS
                            </div>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value="glow">
                        <div className='flex items-center gap-2'>
                            <FontAwesomeIcon icon={faGavel} width={18} height={18} className='text-primary' />
                            <div className='hidden md:flex'>
                                GLOW STAKING
                            </div>
                        </div>
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="go">
                    <LiquidStakingSkeleton />
                </TabsContent>
                <TabsContent value="grow">
                    <GrowRewardsSkeleton />
                </TabsContent>
                <TabsContent value="glow">
                    <GlowStaking />
                </TabsContent>
            </Tabs>
        </main>)
}

export default DashboardSkeleton