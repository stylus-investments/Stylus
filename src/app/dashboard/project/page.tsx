import DashboardHeader from '@/components/dashboard/dashboard-header'
import DashboardLinksFooter from '@/components/dashboard/dashboard-links-footer'
import ProjectCards from '@/components/dashboard/project/project-cards'
import React from 'react'

const ProjectPage = () => {
  return (
    <div>
      <DashboardHeader currentPage='project' />
      <DashboardLinksFooter currentPage='project' />
      <ProjectCards />
    </div>
  )
}

export default ProjectPage