
import { caller } from '@/app/_trpc/server'
import OrderMessageForm from '@/components/admin/order/order-message-form'
import DashboardHeader from '@/components/dashboard/dashboard-header'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { getUserId } from '@/lib/privy'
import { redirect } from 'next/navigation'
import React from 'react'

interface Props {
    params: {
        orderID: string
    }
}

const ClientOrderMesages = async ({ params }: Props) => {

    const { orderID } = params

    const user = await getUserId()
    if (!user) redirect('/connect')

    const order = await caller.message.getOrderMessages(orderID)
    if (!order) redirect('/dashboard/wallet')

    return (
        <div>
            <DashboardHeader currentPage='wallet' />
            <div className='padding flex flex-col pt-24 gap-5 w-full items-center'>
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard/wallet">Wallet</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Order Details</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <OrderMessageForm initialData={order} sender='user' />
            </div>
        </div>
    )
}

export default ClientOrderMesages