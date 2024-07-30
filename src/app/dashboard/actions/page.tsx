import DashboardHeader from '@/components/dashboard/dashboard-header'
import DashboardLinksFooter from '@/components/dashboard/dashboard-links-footer'
import React from 'react'

const ActionsPage = () => {
  return (
    <div>
      <DashboardHeader currentPage='actions' />
      <DashboardLinksFooter currentPage='actions' />
    </div>
  )
}

export default ActionsPage