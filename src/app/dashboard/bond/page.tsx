import DashboardHeader from '@/components/dashboard/dashboard-header'
import DashboardLinksFooter from '@/components/dashboard/dashboard-links-footer'
import React from 'react'

const BondPage = () => {
  return (
    <div>
      <DashboardHeader currentPage='bond' />
      <DashboardLinksFooter currentPage='bond' />
    </div>
  )
}

export default BondPage