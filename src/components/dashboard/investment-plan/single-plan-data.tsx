import React from 'react'
import OrderHistory from '../liquid-staking/order-history'
import { caller } from '@/app/_trpc/server'
import FilterOrderHistory from './filter-order-history'

const SinglePlanData = ({ initialData, status }: {
    initialData: Awaited<ReturnType<typeof caller['investment']['retrieveSinglePlan']>>
    status?: string
}) => {

    return (

        <div className='py-28 padding flex flex-col gap-10'>
            <FilterOrderHistory name={initialData.data.name} status={status} />
            <OrderHistory initialData={initialData} />
        </div>
    )
}

export default SinglePlanData