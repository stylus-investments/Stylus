import { caller } from '@/app/_trpc/server'
import DashboardHeader from '@/components/dashboard/dashboard-header'
import DashboardLinksFooter from '@/components/dashboard/dashboard-links-footer'
import ReferralTabs from '@/components/dashboard/referrals/referral-tabs'
import ReferralInfo from '@/components/referrals/referral-info'
import { cookies } from 'next/headers'
import React from 'react'

const ReferralsPage = async ({ searchParams }: {
  searchParams: {
      page: string | undefined
  }
}) => {

  cookies()
  const userReferralInfo = await caller.referral.getUserReferralInfo()

  return (
    <div>
      <DashboardHeader currentPage='referrals' />
      <DashboardLinksFooter currentPage='referrals' />
      <div className='py-28 padding flex flex-col gap-5 md:gap-10'>
        <ReferralInfo initialData={userReferralInfo} />
        <ReferralTabs page={searchParams.page} />
      </div>
    </div>
  )
}

export default ReferralsPage