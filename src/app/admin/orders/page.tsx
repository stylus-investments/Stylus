import { caller } from '@/app/_trpc/server'
import AdminHeader from '@/components/admin/admin-header'
import OrderTable from '@/components/admin/orders/order-table'
import { getAuth } from '@/lib/nextAuth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'

const AdminUsersPage = async () => {

    cookies()
    const session = await getAuth()
    if (session?.user.wallet) {
        redirect('/dashboard')
    }
    const orders = await caller.order.getAll()

    return (
        <>
            <AdminHeader />
            <OrderTable orders={orders} />
        </>
    )
}

export default AdminUsersPage