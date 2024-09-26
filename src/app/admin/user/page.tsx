import { caller } from '@/app/_trpc/server'
import AdminHeader from '@/components/admin/admin-header'
import UsersTable from '@/components/admin/user/users-table'
import { cookies } from 'next/headers'
import React from 'react'

const Page = async ({ searchParams }: {
    searchParams: {
        status: string
        first_name: string
        last_name: string
        email: string
        page: string
    }
}) => {

    cookies()

    const users = await caller.user.getAllUsers({
        page: searchParams.page,
        email: searchParams.email,
        first_name: searchParams.first_name,
        last_name: searchParams.last_name,
        status: searchParams.status
    })

    const filter = {
        status: searchParams.status,
        first_name: searchParams.first_name,
        last_name: searchParams.last_name,
        email: searchParams.email,
    }

    return (
        <>
            <AdminHeader currentPage='user' />
            <UsersTable users={users} filter={filter} />
        </>
    )
}

export default Page