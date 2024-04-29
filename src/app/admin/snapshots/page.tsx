import { caller } from '@/app/_trpc/server'
import AdminHeader from '@/components/admin/admin-header'
import SnapshotsTable from '@/components/admin/snapshots/SnapshotsTable'
import React from 'react'

export const revalidate = 10800

const AdminSnapshotsPage = async () => {

    const snapshotData = await caller.snapshot.getAllSnapshot()

    return (
        <>
            <AdminHeader />
            <SnapshotsTable snapshotData={snapshotData} />
        </>
    )
}

export default AdminSnapshotsPage