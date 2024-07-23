import { caller } from '@/app/_trpc/server'
import DashboardHeader from '@/components/dashboard/dashboard-header'
import DashboardLinksFooter from '@/components/dashboard/dashboard-links-footer'
import GrowRewards from '@/components/dashboard/grow-rewards/grow-rewards'
import { getAuth } from '@/lib/nextAuth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'

const RewardPage = async () => {

  cookies()
  const session = await getAuth()
  if (!session) {
    redirect('/connect')
  }
  const initialData = await caller.dashboard.getDashboardData()

  return (
    <div className='flex flex-col gap-8 w-full py-24'>
      <DashboardHeader currentPage='reward' />
      <GrowRewards initialData={initialData} />
      <DashboardLinksFooter currentPage='reward' />
    </div>
  )
}

export default RewardPage