import { caller } from '@/app/_trpc/server'
import DashboardHeader from '@/components/dashboard/dashboard-header'
import DashboardLinksFooter from '@/components/dashboard/dashboard-links-footer'
import SinglePlanData from '@/components/dashboard/investment-plan/single-plan-data'
import { getUserId } from '@/lib/privy'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'

const PlanOrdersPage = async ({ params }: {
    params: {
        planID: string
    }
}) => {

    cookies()
    const user = await getUserId()
    if (!user) redirect('/connect')

    const retrievePlan = await caller.investment.retrieveSinglePlan(params.planID)
    if (!retrievePlan) redirect('/dashboard/wallet/plans')

    return (
        <div>
            <DashboardHeader currentPage='wallet' />
            <DashboardLinksFooter currentPage='wallet' />
            <SinglePlanData user_id={user} initialData={retrievePlan} />
        </div>
    )
}

export default PlanOrdersPage