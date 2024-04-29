import { caller } from '@/app/_trpc/server'
import AdminHeader from '@/components/admin/admin-header'
import UsersTable from '@/components/admin/users/UsersTable'
import React from 'react'

export const revalidate = 10800

const AdminUsersPage = async () => {

    const usersData = await caller.user.getAll()

    return (
        <>
            <AdminHeader />
            <UsersTable userData={usersData} />
        </>
    )
}

export default AdminUsersPage