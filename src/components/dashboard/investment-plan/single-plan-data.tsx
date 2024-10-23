import React from 'react'
import OrderHistory from '../liquid-staking/order-history'
import { caller } from '@/app/_trpc/server'
import FilterOrderHistory from './filter-order-history'

const SinglePlanData = ({ filter, params }: {
    filter: {
        status: string | undefined;
        request_chat: string;
    }
    params: {
        planID: string
    }
}) => {

    return (

        <div className='py-28 padding flex flex-col gap-10'>
            <FilterOrderHistory planID={params.planID} filter={filter} />
            <OrderHistory plan_id={params.planID} />
        </div>
    )
}

export default SinglePlanData