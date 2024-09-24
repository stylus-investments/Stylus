import { caller } from '@/app/_trpc/server'
import AdminHeader from '@/components/admin/admin-header'
import UsersTable from '@/components/admin/user/users-table'
import { ProfileStatus } from '@prisma/client'
import { cookies } from 'next/headers'
import React from 'react'

const Page = async ({ searchParams }: {
    searchParams: {
        status: ProfileStatus
        page: string
    }
}) => {

    cookies()

    const users = await caller.user.getAllUsers({
        page: searchParams.page,
        status: searchParams.status
    })

    return (
        <>
            <AdminHeader currentPage='user' />
            <UsersTable users={users} />
        </>
    )
}

export default Page