import { caller } from '@/app/_trpc/server'
import AdminHeader from '@/components/admin/admin-header'
import CompleteOrder from '@/components/admin/order/complete-order'
import InvalidOrder from '@/components/admin/order/invalid-order'
import OrderMessageForm from '@/components/admin/order/order-message-form'
import ToggleOrderConversation from '@/components/admin/order/toggle-order-conversation'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { ORDERSTATUS } from '@/constant/order'
import { Ban, CircleCheckBig, MessageCircleOff } from 'lucide-react'
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
                <div className='gap-3 flex flex-col w-full sm:w-auto'>
                    <OrderMessageForm initialData={order} sender='admin' />
                    <div className='flex  items-center gap-5'>
                        <ToggleOrderConversation orderID={order.id} closed={order.closed} />
                        <InvalidOrder orderID={order.id} />
                        <CompleteOrder orderID={order.id} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default OrderMessagePage