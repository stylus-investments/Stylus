import DashboardHeader from '@/components/dashboard/dashboard-header'
import DashboardLinksFooter from '@/components/dashboard/dashboard-links-footer'
import SPHPOrderHistory from '@/components/dashboard/project/sphp/sphp-order-history'
import React from 'react'

const SPHPOrdersPage = ({ searchParams }: {
    searchParams: {
        status: string | undefined
        request_chat: string
    }
}) => {

    const filter = {
        status: searchParams.status,
        request_chat: searchParams.request_chat,
    }


    return (
        <div>
            <DashboardHeader currentPage='wallet' />
            <DashboardLinksFooter currentPage='wallet' />
            <SPHPOrderHistory filter={filter} />
        </div>
    )
}

export default SPHPOrdersPage