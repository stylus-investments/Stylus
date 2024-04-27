'use client'
import React, { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDatabase, faGavel, faSeedling } from '@fortawesome/free-solid-svg-icons'
import GrowRewards from './grow-rewards/grow-rewards'
import GlowStaking from './glow-staking/glow-staking'
import LiquidStaking from './liquid-staking/liquid-staking'
import { trpc } from '@/app/_trpc/client'
import { Button } from '../ui/button'
import Link from 'next/link'
import { caller } from '@/app/_trpc/server'

interface Props {
    initialData: Awaited<ReturnType<(typeof caller['dashboard']['getLiquidStaking'])>>
}

const Dashboard = ({ initialData }: Props) => {

    const [prevSession, setPrevSession] = useState(initialData.user.wallet)

    const session = trpc.session.get.useQuery(undefined, {
        refetchOnMount: false,
        refetchOnReconnect: false,
    })

    const { data, refetch } = trpc.dashboard.getLiquidStaking.useQuery(undefined, {
        initialData: initialData,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        retry: false
    })

    useEffect(() => {

        if (session.data !== prevSession) {
            setPrevSession(session.data || '')
            refetch()
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session.data])

    return (
        <main className='container flex flex-col items-center pt-32 pb-10 gap-10'>

            <div className='flex flex-col gap-3 items-center text-center'>
                <Image width={100} height={50} className='h-auto rounded-full' alt='Coin' src={'/go.jpeg'} />
                <h1 className='font-black text-xl'>{(Number(data.user.current_go_balance)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $GO</h1>
                <h1 className='text-muted-foreground'>Total balance in your wallet</h1>
                <div className='flex items-center gap-5'>
                    <Link href={process.env.NEXT_PUBLIC_GRAPHENE_LINK as string} target='_blank'>
                        <Button className='h-8 rounded-3xl bg-green-500 hover:bg-green-500'>
                            Add More $GO
                        </Button>
                    </Link>
                </div>
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
                    <LiquidStaking dashboardData={data} />
                </TabsContent>
                <TabsContent value="grow">
                    <GrowRewards dashboardData={{
                        wallet: data.user.wallet
                    }} />
                </TabsContent>
                <TabsContent value="glow">
                    <GlowStaking />
                </TabsContent>
            </Tabs>
        </main>
    )
}

export default Dashboard
