import React from 'react'
import OrderHistory from '../liquid-staking/order-history'
import FilterOrderHistory from './filter-order-history'

const SinglePlanData = ({ filter, params,pagination }: {
    filter: {
        status: string | undefined;
        request_chat: string;
    }
    params: {
        planID: string
    }
    pagination: {
        page: string | undefined;
    }
}) => {

    return (

        <div className='py-28 padding flex flex-col gap-10'>
            <FilterOrderHistory planID={params.planID} filter={filter} />
            <OrderHistory pagination={pagination} plan_id={params.planID} />
        </div>
    )
}

export default SinglePlanData