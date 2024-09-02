import React from 'react'
import OrderHistory from '../liquid-staking/order-history'
import { caller } from '@/app/_trpc/server'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import Link from 'next/link'

const SinglePlanData = ({ initialData, user_id }: {
    user_id: string
    initialData: Awaited<ReturnType<typeof caller['investment']['retrieveSinglePlan']>>
}) => {

    return (

        <div className='pt-28 padding flex flex-col gap-10'>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <Link href={'/dashboard/wallet/'}>
                            Wallet
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <Link href={'/dashboard/wallet/plans'}>
                            Investment Plans
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{initialData.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <OrderHistory initialData={initialData} user_id={user_id} />
        </div>
    )
}

export default SinglePlanData