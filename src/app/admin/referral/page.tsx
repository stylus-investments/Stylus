import { caller } from '@/app/_trpc/server'
import AdminHeader from '@/components/admin/admin-header'
import PayoutRequestTable from '@/components/admin/referrals/payout-request'
import { cookies } from 'next/headers'
import React from 'react'

const ReferralsPayoutPage = async () => {

    cookies()
    const payoutList = await caller.referral.getAllPayouts()

    return (
        <div>
            <AdminHeader currentPage='referral' />
            <div className='pt-28 padding'>
                <PayoutRequestTable initialData={payoutList} />
            </div>
        </div>
    )
}

export default ReferralsPayoutPage