import { caller } from '@/app/_trpc/server'
import DashboardHeader from '@/components/dashboard/dashboard-header'
import DashboardLinksFooter from '@/components/dashboard/dashboard-links-footer'
import BalancesHeader from '@/components/dashboard/liquid-staking/balances-header'
import WalletTabs from '@/components/dashboard/wallet/wallet-tabs'
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
        </div>
    )
}

export default WalletPage