'use client'
import { trpc } from '@/app/_trpc/client'
import { caller } from '@/app/_trpc/server'
import TablePagination from '@/components/dashboard/table-pagination'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import usePaginationStore from '@/state/paginationStore'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

interface SnapshotTableProps {
    snapshotData: Awaited<ReturnType<(typeof caller['snapshot']['getAllSnapshot'])>>
}

const SnapshotsTable: React.FC<SnapshotTableProps> = ({ snapshotData }) => {

    const { data } = trpc.snapshot.getAllSnapshot.useQuery(undefined, {
        initialData: snapshotData,
        refetchOnMount: false,
        refetchOnReconnect: false,
    })

    const { currentPage, getCurrentData } = usePaginationStore()

    const [currentTable, setCurrentTable] = useState<{
        id: number;
        start_date: string;
        end_date: string;
        completed: boolean;
        total_holders: number;
        total_unpaid_holders: number;
    }[] | undefined>(snapshotData)

    useEffect(() => {

        setCurrentTable(getCurrentData(data))

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, data])


    return (
        <div className='padding pt-28 flex flex-col gap-8'>
            <Table>
                <TableCaption>Snapshot History</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead>Total Holders</TableHead>
                        <TableHead>Unpaid Holders</TableHead>
                        <TableHead>Operation</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentTable && currentTable.length > 0 ? currentTable.map(data => (
                        <TableRow key={data.id} className='text-muted-foreground hover:text-foreground'>
                            <TableCell className="font-medium">{data.id}</TableCell>
                            <TableCell>
                                {
                                    new Date(data.start_date).toLocaleString('en-US', {
                                        timeZone: 'UTC',
                                        weekday: 'short',
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })
                                }  UTC
                            </TableCell>
                            <TableCell>
                                {
                                    new Date(data.end_date).toLocaleString('en-US', {
                                        timeZone: 'UTC',
                                        weekday: 'short',
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })
                                }  UTC
                            </TableCell>
                            <TableCell>{data.completed ? 'YES' : 'NO'}</TableCell>
                            < TableCell > {data.total_holders}</TableCell>
                            <TableCell>{data.total_unpaid_holders}</TableCell>
                            <TableCell>
                                <Link
                                    href={`/admin/snapshots/users/${data.id}?start_date=${new Date(data.start_date).toLocaleString('en-US', {
                                        timeZone: 'UTC',
                                        weekday: 'short',
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })
                                        } UTC&end_date=${new Date(data.end_date).toLocaleString('en-US', {
                                            timeZone: 'UTC',
                                            weekday: 'short',
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })
                                        } UTC`} >
                                    <Button className='h-7 rounded-3xl'>View</Button>
                                </Link>
                            </TableCell>
                        </TableRow>
                    )) :
                        <TableRow>
                            <TableCell>No Data</TableCell>
                        </TableRow>
                    }
                </TableBody>
            </Table>
            <TablePagination data={snapshotData} />
        </div >
    )
}

export default SnapshotsTable