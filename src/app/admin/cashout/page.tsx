import { caller } from '@/app/_trpc/server'
import AdminHeader from '@/components/admin/admin-header'
import CashoutTable from '@/components/admin/cashout/cashout-table'
import { cashout_status } from '@prisma/client'
import { cookies } from 'next/headers'
import React from 'react'

const CashoutPage = async ({ searchParams }: {
    searchParams: {
        status: cashout_status | undefined
        page: string
    }
}) => {

    cookies()

    const cashoutList = await caller.cashout.qCashoutList({
        page: searchParams.page,
        status: searchParams.status,
    })

    const filter = {
        status: searchParams.status,
    }

    return (
        <>
            <AdminHeader currentPage='cashout' />
            <CashoutTable filter={filter} cashoutList={cashoutList} />
        </>
    )

}

export default CashoutPage