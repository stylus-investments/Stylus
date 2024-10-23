import { caller } from '@/app/_trpc/server'
import AssetActions from '@/components/dashboard/assets/asset-actions'
import AssetBalancesHeader from '@/components/dashboard/assets/asset-balance-header'
import AssetHistory from '@/components/dashboard/assets/asset-history'
import DashboardHeader from '@/components/dashboard/dashboard-header'
import DashboardLinksFooter from '@/components/dashboard/dashboard-links-footer'
import { redirect } from 'next/navigation'
import React from 'react'

const AssetData = async ({ params }: {
    params: {
        token_address: string
    }
}) => {

    if (!params.token_address) redirect('/dashboard/wallet')

    return (
        <div className='flex flex-col gap-5 w-full py-24 padding'>
            <DashboardHeader currentPage='wallet' />
            <DashboardLinksFooter currentPage='wallet' />
            <AssetBalancesHeader tokenAddress={params.token_address} />
            <AssetActions tokenAddress={params.token_address} />
            <AssetHistory tokenAddress={params.token_address} />
        </div>
    )

}

export default AssetData