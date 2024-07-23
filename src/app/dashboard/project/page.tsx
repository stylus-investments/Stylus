import DashboardHeader from '@/components/dashboard/dashboard-header'
import DashboardLinksFooter from '@/components/dashboard/dashboard-links-footer'
import React from 'react'

const ProjectPage = () => {
  return (
    <div>
      <DashboardHeader currentPage='project' />
      <DashboardLinksFooter currentPage='project' />
    </div>
  )
}

export default ProjectPage