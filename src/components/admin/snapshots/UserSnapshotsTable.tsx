'use client'
import { trpc } from '@/app/_trpc/client'
import { caller } from '@/app/_trpc/server'
import TablePagination from '@/components/dashboard/table-pagination'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { returnSnapshotStatus } from '@/lib/snapshot'
import usePaginationStore from '@/state/paginationStore'
import React, { useEffect, useState } from 'react'
import UserSnapshotBreadCrumb from './UserSnapshotBreadCrumb'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { useSearchParams } from 'next/navigation'

interface SnapshotTableProps {
    snapshotData: Awaited<ReturnType<(typeof caller['snapshot']['getData'])>>
    snapshotID: number
}

const UserSnapshotTable: React.FC<SnapshotTableProps> = ({ snapshotData, snapshotID }) => {

    const searchParams = useSearchParams()

    const snapshotStartDate = searchParams.get('start_date')
    const snapshotEndDate = searchParams.get('end_date')

    const { data, refetch } = trpc.snapshot.getData.useQuery(Number(snapshotID), {
        initialData: snapshotData,
        refetchOnMount: false,
        refetchOnReconnect: false
    })
    const updateUserSnapshots = trpc.snapshot.updateUserSnapshot.useMutation()

    const currentSnapshotDate =
        snapshotStartDate &&
        snapshotEndDate &&
        `${snapshotStartDate} - ${snapshotEndDate}`

    const { getCurrentData, currentPage } = usePaginationStore()

    const [currentTable, setCurrentTable] = useState<{
        id: number;
        wallet: string;
        stake: string;
        reward: string;
        status: number;
    }[] | undefined>(data)

    const downloadTable = () => {
        const csvRows = []
        const headers = [currentSnapshotDate]

        // Push the headers
        csvRows.push(headers.join(','))

        // Push each row of data
        snapshotData.forEach(row => {
            if (row.status > 1) {

                const values = [
                    `"${row.wallet} ${row.reward}"`,
                ]
                csvRows.push(values)
            }
        })

        // Combine rows into a single CSV string
        const csvString = csvRows.join('\n')

        // Create a blob from the CSV string
        const blob = new Blob([csvString], { type: 'text/csv' })

        // Create a download link
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.setAttribute('download', `${currentSnapshotDate}.csv`)
        document.body.appendChild(link)

        // Trigger the download
        link.click()

        // Clean up
        document.body.removeChild(link)
    }

    useEffect(() => {

        setCurrentTable(getCurrentData(data))

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, currentPage])

    return (
        <div className='container pt-10 flex flex-col gap-8'>
            <header className='flex w-full items-center justify-between'>
                <UserSnapshotBreadCrumb />
                <div className='text-sm'>
                    {currentSnapshotDate || <Skeleton className='h-6 w-96 rounded-3xl' />}
                </div>
                <div className='flex items-center gap-5'>
                    <Button className='h-8' onClick={downloadTable}>Download Table</Button>
                    <Button className='h-8' variant={'outline'} onClick={async () => {
                        updateUserSnapshots.mutate(Number(snapshotID), {
                            onSuccess: async () => {
                                await refetch()
                                toast.success("Success! snapshot updated.")
                            },
                            onError: (error) => {
                                toast.error(error.message)
                            }
                        })
                    }}>Update Snapshot</Button>
                </div>
            </header>
            <Table>
                <TableCaption>Snapshot History</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Wallet Address</TableHead>
                        <TableHead>Stake</TableHead>
                        <TableHead>Reward</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Operation</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentTable && currentTable.length > 0 ? currentTable.map(data => (
                        <TableRow key={data.id} className='text-muted-foreground hover:text-foreground'>
                            <TableCell className="font-medium">{data.id}</TableCell>
                            <TableCell>{data.wallet}</TableCell>
                            <TableCell>{data.stake}</TableCell>
                            < TableCell > {data.reward}</TableCell>
                            <TableCell>{returnSnapshotStatus(data.status)}</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    )) :
                        <TableRow>
                            <TableCell>No Data</TableCell>
                        </TableRow>
                    }
                </TableBody>
            </Table>
            <TablePagination data={data} />
        </div>
    )
}

export default UserSnapshotTable