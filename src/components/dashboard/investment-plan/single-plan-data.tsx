import React from 'react'
import OrderHistory from '../liquid-staking/order-history'
import { caller } from '@/app/_trpc/server'
import FilterOrderHistory from './filter-order-history'

const SinglePlanData = ({ initialData, filter }: {
    initialData: Awaited<ReturnType<typeof caller['investment']['retrieveSinglePlan']>>
    filter: {
        status: string | undefined;
        request_chat: string;
    }
}) => {

    return (

        <div className='py-28 padding flex flex-col gap-10'>
            <FilterOrderHistory name={initialData.data.name} filter={filter} />
            <OrderHistory initialData={initialData} />
        </div>
    )
}

export default SinglePlanData