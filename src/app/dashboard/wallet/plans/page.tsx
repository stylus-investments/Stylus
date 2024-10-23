import DashboardHeader from '@/components/dashboard/dashboard-header'
import DashboardLinksFooter from '@/components/dashboard/dashboard-links-footer'
import UserPlansTable from '@/components/dashboard/investment-plan/plan-table'
import React from 'react'

const InvestmentPlanPage = () => {

    return (
        <div>
            <DashboardHeader currentPage='wallet' />
            <DashboardLinksFooter currentPage='wallet' />
            <UserPlansTable />
        </div>
    )
}

export default InvestmentPlanPage