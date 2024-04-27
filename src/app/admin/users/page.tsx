import AdminHeader from '@/components/admin/admin-header'
import { cookies } from 'next/headers'
import React from 'react'

const AdminUsersPage = () => {

    cookies()
    return (
        <>
            <AdminHeader />
        </>
    )
}

export default AdminUsersPage