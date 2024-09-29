import { caller } from '@/app/_trpc/server'
import DashboardHeader from '@/components/dashboard/dashboard-header'
import DashboardLinksFooter from '@/components/dashboard/dashboard-links-footer'
import SinglePlanData from '@/components/dashboard/investment-plan/single-plan-data'
import { getUserId } from '@/lib/privy'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'

const PlanOrdersPage = async ({ params, searchParams }: {
    params: {
        planID: string
    },
    searchParams: {
        page: string | undefined
        status: string | undefined
    }
}) => {

    cookies()
    const user = await getUserId()
    if (!user) redirect('/connect')

    try {
        const initialData = await caller.investment.retrieveSinglePlan({
            plan_id: params.planID,
            page: searchParams.page,
            status: searchParams.status
        })

        return (
            <div>
                <DashboardHeader currentPage='wallet' />
                <DashboardLinksFooter currentPage='wallet' />
                <SinglePlanData initialData={initialData} status={searchParams.status} />
            </div>
        )

    } catch (error) {
        console.log(error);
        redirect('/dashboard/wallet/plans')
    }
}

export default PlanOrdersPage