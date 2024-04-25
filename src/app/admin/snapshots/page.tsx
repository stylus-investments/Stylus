import { caller } from '@/app/_trpc/server'
import AdminHeader from '@/components/admin/admin-header'
import SnapshotsTable from '@/components/admin/snapshots/SnapshotsTable'
import React from 'react'

const AdminSnapshotsPage = async () => {

    const snapshotData = await caller.snapshot.get()

    return (
        <>
            <AdminHeader />
            <SnapshotsTable snapshotData={snapshotData} />
        </>
    )
}

export default AdminSnapshotsPage