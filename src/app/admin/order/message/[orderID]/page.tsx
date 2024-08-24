import { caller } from '@/app/_trpc/server'
import AdminHeader from '@/components/admin/admin-header'
import OrderMessageForm from '@/components/admin/order/order-message-form'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
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
            <div className='padding flex flex-col pt-24 gap-5 w-full items-center'>
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/admin/order">Orders</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Order Details</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <OrderMessageForm initialData={order} sender='admin' />
            </div>
        </>
    )
}

export default OrderMessagePage