import { caller } from '@/app/_trpc/server'
import DashboardHeader from '@/components/dashboard/dashboard-header'
import DashboardLinksFooter from '@/components/dashboard/dashboard-links-footer'
import BalancesHeader from '@/components/dashboard/liquid-staking/balances-header'
import StakingData from '@/components/dashboard/liquid-staking/staking-data'
import WalletTabs from '@/components/dashboard/wallet/wallet-tabs'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { getUserId } from '@/lib/privy'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'

const WalletPage = async () => {

    cookies()
    const user = await getUserId()
    if (!user) redirect('/connect')

    const initialData = await caller.dashboard.getWalletData()

    return (
        <div className='flex flex-col gap-5 w-full py-24'>
            <DashboardHeader currentPage='wallet' />
            <DashboardLinksFooter currentPage='wallet' />
            <BalancesHeader balances={initialData.balances.currentBalances} />
            <WalletTabs
                assets={initialData.balances.assets}
            />
            <div className='relative padding py-5'>
                <Separator />
                <Label className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-5 bg-card lg:text-base">LIQUID STAKING</Label>
            </div>
            {/* <StakingData snapshot={initialData.snapshot} saveBalance={initialData.balances.current_save_balance} /> */}
        </div>
    )
}

export default WalletPage