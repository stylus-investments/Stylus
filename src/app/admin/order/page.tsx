import { caller } from '@/app/_trpc/server'
import AdminHeader from '@/components/admin/admin-header'
import OrderTable from '@/components/admin/order/order-table'
import React from 'react'

const OrderPage = async () => {

    const orders = await caller.order.getAllOrder()

    console.log(orders)
    return (
        <>
            <AdminHeader />
            <OrderTable orders={orders} />
        </>
    )

}

export default OrderPage