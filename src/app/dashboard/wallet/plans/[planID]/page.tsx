import DashboardHeader from '@/components/dashboard/dashboard-header'
import DashboardLinksFooter from '@/components/dashboard/dashboard-links-footer'
import SinglePlanData from '@/components/dashboard/investment-plan/single-plan-data'
import React from 'react'

const PlanOrdersPage = ({ params, searchParams }: {
    params: {
        planID: string
    },
    searchParams: {
        page: string | undefined
        status: string | undefined
        request_chat: string
    }
}) => {

    const filter = {
        status: searchParams.status,
        request_chat: searchParams.request_chat
    }

    const pagination = {
        page: searchParams.page
    }

    return (
        <div>
            <DashboardHeader currentPage='wallet' />
            <DashboardLinksFooter currentPage='wallet' />
            <SinglePlanData filter={filter} params={params} pagination={pagination} />
        </div>
    )
}

export default PlanOrdersPage