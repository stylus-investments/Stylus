'use client'
import DashboardHeader from '@/components/dashboard/dashboard-header'
import DashboardLinksFooter from '@/components/dashboard/dashboard-links-footer'
import { usePrivy } from '@privy-io/react-auth'
import { redirect } from 'next/navigation'
import React from 'react'

const RewardPage = () => {

  const { ready, authenticated } = usePrivy()

  if (ready && !authenticated) redirect('/connect')

  return (
    <div className='flex flex-col gap-8 w-full py-24'>
      <DashboardHeader currentPage='reward' />
      {/* <GrowRewards data={data} /> */}
      <DashboardLinksFooter currentPage='reward' />
    </div>
  )
}

export default RewardPage