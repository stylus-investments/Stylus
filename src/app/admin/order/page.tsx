import { caller } from '@/app/_trpc/server'
import AdminHeader from '@/components/admin/admin-header'
import OrderTable from '@/components/admin/order/order-table'
import { ORDERSTATUS } from '@/constant/order'
import { cookies } from 'next/headers'
import React from 'react'

const OrderPage = async ({ searchParams }: {
    searchParams: {
        status: string | undefined
    }
}) => {

    cookies()

    const orders = await caller.order.getAllOrder(searchParams.status || ORDERSTATUS['processing'])

    return (
        <>
            <AdminHeader currentPage='order' />
            <div>

            </div>
            <OrderTable orders={orders} />
        </>
    )

}

export default OrderPage