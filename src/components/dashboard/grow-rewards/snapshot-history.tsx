'use client'
import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import usePaginationStore from '@/state/paginationStore';
import { Card, CardContent } from '@/components/ui/card';
import TablePagination from '../table-pagination';
import { trpc } from '@/app/_trpc/client';
import { Skeleton } from '@/components/ui/skeleton';

const SnapshotHistory = ({ wallet }: {
    wallet: string
}) => {

    const { data, isLoading } = trpc.dashboard.getUserSnapshotHistory.useQuery(wallet, {
        refetchOnMount: false
    })

    const [currentTable, setCurrentTable] = useState<any[] | undefined>(undefined)
    const { getCurrentData, currentPage } = usePaginationStore()

    useEffect(() => {

        setCurrentTable(getCurrentData(data))

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, currentPage])

    const returnSnapshotStatusButton = (status: number) => {
        if (status === 1) return <Button className="h-6 rounded-3xl hover:bg-orange-500 bg-orange-500">Holding Period</Button>
        if (status === 2) return <Button className="h-6 rounded-3xl hover:bg-orange-400 bg-orange-400">Pending Rewards</Button>
        if (status === 3) return <Button className="h-6 rounded-3xl hover:bg-green-500 bg-green-500">Rewarded</Button>
        return <Button className='bg-red-500 h-6 rounded-3xl hover:bg-red-500'>Went Below Minimum</Button>
    }

    return (
        <Card>
            <CardContent className='flex flex-col gap-2'>
                <Table>
                    <TableCaption>Snapshot History</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Month</TableHead>
                            <TableHead>Snapshot</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Start</TableHead>
                            <TableHead>Finish</TableHead>
                            <TableHead>Rewards</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? <SnapshotHistorySkeleton /> : currentTable && currentTable.length > 0 ?
                            currentTable.map((snapshot) => (
                                <TableRow key={(snapshot).id} className='text-muted-foreground hover:text-foreground'>
                                    <TableCell>{snapshot.month}</TableCell>
                                    <TableCell>{snapshot.stake}</TableCell>
                                    <TableCell>{returnSnapshotStatusButton(snapshot.status)}</TableCell>
                                    <TableCell>
                                        {
                                            new Date(snapshot.snapshot.start_date).toLocaleString('en-US', {
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
                                            new Date(snapshot.snapshot.end_date).toLocaleString('en-US', {
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
                                    <TableCell>{snapshot.reward} $GROW</TableCell>
                                </TableRow>
                            ))
                            :
                            <TableRow>
                                <TableCell>No Data</TableCell>
                            </TableRow>
                        }
                    </TableBody>
                </Table>
                <TablePagination data={data || []} />
            </CardContent>
        </Card>

    )
}

const SnapshotHistorySkeleton = () => {

    return (
        <>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(skeleton => (
                <TableRow key={skeleton}>
                    <TableCell>
                        <Skeleton className='w-6 h-5 rounded-3xl' />
                    </TableCell>
                    <TableCell>
                        <Skeleton className='w-28 h-5 rounded-3xl' />
                    </TableCell>
                    <TableCell>
                        <Skeleton className='w-36 h-5 rounded-3xl' />
                    </TableCell>
                    <TableCell>
                        <Skeleton className='w-52 h-5 rounded-3xl' />
                    </TableCell>
                    <TableCell>
                        <Skeleton className='w-52 h-5 rounded-3xl' />
                    </TableCell>
                    <TableCell>
                        <Skeleton className='w-32 h-5 rounded-3xl' />
                    </TableCell>
                </TableRow>
            ))}
        </>
    )
}

export default SnapshotHistory