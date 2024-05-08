import { caller } from '@/app/_trpc/server'
import AdminHeader from '@/components/admin/admin-header'
import SnapshotsTable from '@/components/admin/snapshots/SnapshotsTable'
import { getAuth } from '@/lib/nextAuth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'

const AdminSnapshotsPage = async () => {

    cookies()
    const session = await getAuth()
    if (session?.user.wallet) {
        redirect('/dashboard')
    }
    const snapshotData = await caller.snapshot.getAllSnapshot()

    return (
        <>
            <AdminHeader />
            <SnapshotsTable snapshotData={snapshotData} />
        </>
    )
}

export default AdminSnapshotsPage