import { caller } from '@/app/_trpc/server'
import AdminHeader from '@/components/admin/admin-header'
import OrderTable from '@/components/admin/order/order-table'
import { cookies } from 'next/headers'
import React from 'react'

const OrderPage = async () => {

    cookies()
    const orders = await caller.order.getAllOrder()

    return (
        <>
            <AdminHeader />
            <OrderTable orders={orders} />
        </>
    )

}

export default OrderPage