'use client'
import { trpc } from '@/app/_trpc/client'
import DashboardHeader from '@/components/dashboard/dashboard-header'
import DashboardLinksFooter from '@/components/dashboard/dashboard-links-footer'
import { usePrivy } from '@privy-io/react-auth'
import { Loader } from 'lucide-react'
import { redirect } from 'next/navigation'
import React from 'react'

const RewardPage = () => {

  const { user, ready, authenticated } = usePrivy()

  if (!ready) return <div className='h-screen grid place-items-center'>
    <Loader size={50} className='animate-spin text-primary' />
  </div>

  if (ready && !authenticated) redirect('/connect')

  if (ready && user?.wallet && user) {

    const { data, isLoading } = trpc.dashboard.getRewardData.useQuery()

    if (!data) return <div className='h-screen grid place-items-center'>
      <Loader size={50} className='animate-spin text-primary' />
    </div>

    return (
      <div className='flex flex-col gap-8 w-full py-24'>
        <DashboardHeader currentPage='reward' />
        {/* <GrowRewards data={data} /> */}
        <DashboardLinksFooter currentPage='reward' />
      </div>
    )
  }
}

export default RewardPage