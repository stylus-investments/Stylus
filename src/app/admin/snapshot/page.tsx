import { caller } from '@/app/_trpc/server'
import AdminHeader from '@/components/admin/admin-header'
import SnapshotsTable from '@/components/admin/snapshots/snapshot-table'
import { cookies } from 'next/headers'
import React from 'react'

const AdminSnapshotPage = async () => {

    cookies()
    const snapshots = await caller.snapshot.getAllSnapshot()

    return (
        <>
            <AdminHeader currentPage='snapshot' />
            <SnapshotsTable snapshotData={snapshots} />
        </>

    )
}

export default AdminSnapshotPage