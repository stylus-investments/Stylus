import { caller } from '@/app/_trpc/server'
import AdminHeader from '@/components/admin/admin-header'
import OrderMessageForm from '@/components/admin/order/order-message-form'
import { redirect } from 'next/navigation'
import React from 'react'

interface Props {
    params: {
        orderID: string
    }
}

const OrderMessagePage = async ({ params }: Props) => {

    const { orderID } = params

    const order = await caller.message.getOrderMessages(orderID)

    if (!order) redirect('/admin/order')

    return (
        <>
            <AdminHeader />
            <OrderMessageForm initialData={order} />
        </>
    )
}

export default OrderMessagePage