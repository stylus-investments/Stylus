import { caller } from '@/app/_trpc/server'
import AdminHeader from '@/components/admin/admin-header'
import SnapshotsTable from '@/components/admin/snapshots/SnapshotsTable'
import { cookies } from 'next/headers'
import React from 'react'

const AdminSnapshotsPage = async () => {

    cookies()
    const snapshotData = await caller.snapshot.getAllSnapshot()

    return (
        <>
            <AdminHeader />
            <SnapshotsTable snapshotData={snapshotData} />
        </>
    )
}

export default AdminSnapshotsPage