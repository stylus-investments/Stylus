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

    try {

        const userTokenData = await caller.dashboard.getAssetData(params.token_address)

        return (
            <div className='flex flex-col gap-5 w-full py-24 padding'>
                <DashboardHeader currentPage='wallet' />
                <DashboardLinksFooter currentPage='wallet' />
                <AssetBalancesHeader tokenData={userTokenData} />
                <AssetActions />
                <AssetHistory tokenData={userTokenData} />
            </div>
        )

    } catch (error) {
        console.log(error);
        redirect('/dashboard/wallet')
    }
}

export default AssetData