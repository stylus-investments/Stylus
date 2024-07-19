'use client'
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDatabase, faSeedling } from '@fortawesome/free-solid-svg-icons'
import GrowRewards from './grow-rewards/grow-rewards'
import LiquidStaking from './liquid-staking/liquid-staking'
import { caller } from '@/app/_trpc/server'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import useProfileStore from '@/state/profileStore'
import ProfilePage from './profile-page'

interface Props {
    initialData: Awaited<ReturnType<(typeof caller['dashboard']['getDashboardData'])>>
}

const Dashboard = ({ initialData }: Props) => {

    const router = useRouter()

    const session = useSession({
        required: true,
        onUnauthenticated() {
            router.push('/connect')
        },
    })

    const { open } = useProfileStore()

    return (
        <main className='flex flex-col items-center py-24 gap-10'>
            <Tabs defaultValue="balances" className="w-full">
                <div className='flex items-center flex-col gap-5 md:gap-0 pb-2 md:flex-row md:justify-between w-full'>
                    <TabsList className="grid w-full md:w-96 lg:w-1/2 grid-cols-2 order-2 md:order-1">
                        <TabsTrigger value="balances">
                            <div className='flex items-center gap-2 sticky'>
                                <FontAwesomeIcon icon={faDatabase} width={18} height={18} className='text-primary' />
                                <div className='md:flex'>
                                    Balances
                                </div>
                            </div>
                        </TabsTrigger>
                        <TabsTrigger value="rewards">
                            <div className='flex items-center gap-2'>
                                <FontAwesomeIcon icon={faSeedling} width={18} height={18} className='text-primary' />
                                <div className='md:flex'>
                                    Rewards
                                </div>
                            </div>
                        </TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="balances">
                    <LiquidStaking initialData={initialData} />
                </TabsContent>
                <TabsContent value="rewards">
                    <GrowRewards initialData={initialData} />
                </TabsContent>
            </Tabs>
            {open && <ProfilePage />}
        </main>
    )
}

export default Dashboard
