'use client'
import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import usePaginationStore from '@/state/paginationStore';
import { Card, CardContent } from '@/components/ui/card';
import TablePagination from '../table-pagination';
import { trpc } from '@/app/_trpc/client';
import SnapshotHistorySkeleton from './snapshot-history-skeleton';

const SnapshotHistory = ({ wallet }: {
    wallet: string
}) => {

    const { data, isLoading } = trpc.dashboard.getUserSnapshotHistory.useQuery(wallet, {
        refetchOnMount: false
    })

    const [currentTable, setCurrentTable] = useState<{
        snapshot: {
            start_date: string;
            end_date: string;
        };
        id: number;
        stake: string;
        reward: string;
        status: number;
        month: number;
    }[] | undefined | undefined>(undefined)
    const { getCurrentData, currentPage } = usePaginationStore()

    useEffect(() => {

        setCurrentTable(getCurrentData(data))

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, currentPage])

    const returnSnapshotStatusButton = (status: number) => {
        if (status === 1) return <Button className="h-6 hover:bg-orange-500 bg-orange-500">Holding Period</Button>
        if (status === 2) return <Button className="h-6 hover:bg-orange-400 bg-orange-400">Pending Rewards</Button>
        if (status === 3) return <Button className="h-6 hover:bg-green-500 bg-green-500">Rewarded</Button>
        return <Button className='bg-red-500 h-6 hover:bg-red-500'>Went Below Minimum</Button>
    }

    return (
        <>
            {isLoading ? <SnapshotHistorySkeleton /> :
                <Card>
                    <CardContent className='flex flex-col gap-2'>
                        <Table>
                            <TableHeader>
                                <TableRow className='text-xs sm:text-sm'>
                                    <TableHead className='min-w-10'>Month</TableHead>
                                    <TableHead className='min-w-56'>Rewards</TableHead>
                                    <TableHead className='min-w-32'>Status</TableHead>
                                    <TableHead className='min-w-16'>Snapshot</TableHead>
                                    <TableHead className='min-w-56'>Start</TableHead>
                                    <TableHead className='min-w-56'>Finish</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentTable && currentTable.length > 0 ?
                                    currentTable.map((snapshot) => (
                                        <TableRow key={(snapshot).id} className='text-muted-foreground hover:text-foreground text-xs md:text-sm'>
                                            <TableCell>{snapshot.month}</TableCell>
                                            <TableCell>{snapshot.reward} EARN</TableCell>
                                            <TableCell>{returnSnapshotStatusButton(snapshot.status)}</TableCell>
                                            <TableCell>{snapshot.stake}</TableCell>
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
                                        </TableRow>
                                    ))
                                    :
                                    <TableRow>
                                        <TableCell>No Data</TableCell>
                                    </TableRow>
                                }
                            </TableBody>
                        </Table>
                        <div className='w-full text-center text-xs sm:text-sm text-muted-foreground'>Snapshot History</div>
                        <TablePagination data={data || []} />
                    </CardContent>
                </Card>
            }
        </>
    )
}

export default SnapshotHistory