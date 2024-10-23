import DashboardHeader from '@/components/dashboard/dashboard-header'
import DashboardLinksFooter from '@/components/dashboard/dashboard-links-footer'
import ReferralTabs from '@/components/dashboard/referrals/referral-tabs'
import ReferralInfo from '@/components/referrals/referral-info'
import React from 'react'

const ReferralsPage = ({ searchParams }: {
  searchParams: {
    page: string | undefined
  }
}) => {

  return (
    <div>
      <DashboardHeader currentPage='referrals' />
      <DashboardLinksFooter currentPage='referrals' />
      <div className='py-28 padding flex flex-col gap-5 md:gap-10'>
        <ReferralInfo />
        <ReferralTabs page={searchParams.page} />
      </div>
    </div>
  )
}

export default ReferralsPage