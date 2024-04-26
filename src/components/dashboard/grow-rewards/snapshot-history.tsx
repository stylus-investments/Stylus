import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import usePaginationStore from '@/state/paginationStore';
import { Card, CardContent } from '@/components/ui/card';
import TablePagination from '../table-pagination';

const SnapshotHistory = ({ history }: {
    history: {
        snapshot: {
            start_date: string;
            end_date: string;
        };
        id: number;
        stake: string;
        month: number
        reward: string;
        status: number;
    }[]
}) => {

    const [currentTable, setCurrentTable] = useState<any[] | null>(null)
    const { getCurrentData, currentPage } = usePaginationStore()

    useEffect(() => {

        setCurrentTable(getCurrentData(history))

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [history, currentPage])

    const returnSnapshotStatusButton = (status: number) => {
        if (status === 1) return <Button className="h-6 hover:bg-orange-500 bg-orange-500">Holding Period</Button>
        if (status === 2) return <Button className="h-6 hover:bg-orange-400 bg-orange-400">Pending Rewards</Button>
        if (status === 3) return <Button className="h-6 hover:bg-green-500 bg-green-500">Rewarded</Button>
        return <Button className='bg-red-500 h-6 hover:bg-red-500'>Went Below Minimum</Button>
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
                        {currentTable && currentTable.length > 0 ?
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
                <TablePagination data={history} />
            </CardContent>
        </Card>

    )
}

export default SnapshotHistory