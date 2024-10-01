import { caller } from '@/app/_trpc/server'
import DashboardHeader from '@/components/dashboard/dashboard-header'
import DashboardLinksFooter from '@/components/dashboard/dashboard-links-footer'
import UserPlansTable from '@/components/dashboard/investment-plan/plan-table'
import { getUserId } from '@/lib/privy'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'

const InvestmentPlanPage = async () => {

    console.log("Test")
    cookies()
    const user = await getUserId()
    if (!user) redirect('/connect')
    const plans = await caller.investment.getUserInvestmentPlans()
    if (!plans) redirect('/dashboard/wallet')

    return (
        <div>
            <DashboardHeader currentPage='wallet' />
            <DashboardLinksFooter currentPage='wallet' />
            <UserPlansTable initialData={plans} />
        </div>
    )
}

export default InvestmentPlanPage