import { caller } from '@/app/_trpc/server'
import DashboardHeader from '@/components/dashboard/dashboard-header'
import DashboardLinksFooter from '@/components/dashboard/dashboard-links-footer'
import BalancesHeader from '@/components/dashboard/liquid-staking/balances-header'
import GuideAccordions from '@/components/dashboard/liquid-staking/guide-accordions'
import StakingData from '@/components/dashboard/liquid-staking/staking-data'
import WalletTable from '@/components/dashboard/wallet/wallet-table'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { getAuth } from '@/lib/nextAuth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'

const WalletPage = async () => {

    cookies()
    const session = await getAuth()
    if (!session) {
        redirect('/connect')
    }

    const initialData = await caller.dashboard.getDashboardData()

    return (
        <div className='flex flex-col gap-8 w-full py-24'>
            <DashboardHeader currentPage='wallet' />
            <BalancesHeader initialData={initialData} />
            <div className='relative padding py-5'>
                <Separator />
                <Label className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-5 bg-card lg:text-base">LIQUID STAKING</Label>
            </div>
            <StakingData initialData={initialData} />
            <div className='relative padding py-5'>
                <Separator />
                <Label className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-5 bg-card lg:text-base">TRANSACTIONS</Label>
            </div>
            <WalletTable />
            <div className='relative padding py-5'>
                <Separator />
                <Label className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-5 bg-card lg:text-base">GUIDES</Label>
            </div>
            <GuideAccordions />
            <DashboardLinksFooter currentPage='wallet' />
        </div>
    )
}

export default WalletPage