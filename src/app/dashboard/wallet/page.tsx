import DashboardHeader from '@/components/dashboard/dashboard-header'
import DashboardLinksFooter from '@/components/dashboard/dashboard-links-footer'
import BalancesHeader from '@/components/dashboard/liquid-staking/balances-header'
import WalletTabs from '@/components/dashboard/wallet/wallet-tabs'
import React from 'react'

const WalletPage = async () => {

    return (
        <div className='flex flex-col gap-5 w-full py-24'>
            <DashboardHeader currentPage='wallet' />
            <DashboardLinksFooter currentPage='wallet' />
            <BalancesHeader />
            <WalletTabs />
        </div>
    )
}

export default WalletPage