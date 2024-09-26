import { caller } from '@/app/_trpc/server'
import AdminHeader from '@/components/admin/admin-header'
import OrderTable from '@/components/admin/order/order-table'
import { cookies } from 'next/headers'
import React from 'react'

const OrderPage = async ({ searchParams }: {
    searchParams: {
        status: string
        page: string
    }
}) => {

    cookies()

    const orders = await caller.order.getAllOrder({
        page: searchParams.page,
        status: searchParams.status
    })

    const filter = {
        status: searchParams.status
    }

    return (
        <>
            <AdminHeader currentPage='order' />
            <OrderTable orders={orders} filter={filter} />
        </>
    )

}

export default OrderPage