import { caller } from '@/app/_trpc/server'
import AdminHeader from '@/components/admin/admin-header'
import UserSnapshotTable from '@/components/admin/snapshots/user-snapshot-table'
import { redirect } from 'next/navigation'
import React from 'react'

interface Props {
    params: {
        snapshotID: number
    }
}

const Page = async ({ params }: Props) => {

    const { snapshotID } = params

    if (!snapshotID) redirect('/admin/snapshot')

    const userSnapshots = await caller.snapshot.getSnapshotData(Number(snapshotID))

    return (
        <>
            <AdminHeader />
            <UserSnapshotTable
                snapshotData={userSnapshots}
                snapshotID={snapshotID} />
        </>
    )
}

export default Page