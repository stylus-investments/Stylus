import ConnectWalletFirst from '@/components/dashboard/connect-wallet-first'
import DashboardHeader from '@/components/dashboard/dashboard-header'
import React from 'react'
const ConnectPage = () => {

    return (
        <div className='padding xl:container overflow-x-hidden xl:overflow-visible'>
            <DashboardHeader currentPage='' />
            <ConnectWalletFirst />
        </div>
    )
}

export default ConnectPage