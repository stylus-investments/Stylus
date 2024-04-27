import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import usePaginationStore from '@/state/paginationStore';
import React, { useEffect, useState } from 'react'
import TablePagination from '../table-pagination';
import { trpc } from '@/app/_trpc/client';
import { Skeleton } from '@/components/ui/skeleton';

const BalanceHistory = ({ address }: { address: string }) => {

    const { data, isLoading } = trpc.dashboard.getGoTokenBalanceHistory.useQuery(address)

    const [currentTable, setCurrentTable] = useState<any[] | undefined>(undefined)

    const { getCurrentData, currentPage } = usePaginationStore()

    useEffect(() => {

        setCurrentTable(getCurrentData(data))

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, currentPage])

    return (
        <Card>
            <CardContent className='flex flex-col gap-5'>
                <Table>
                    <TableCaption>$Go Transaction History</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Transaction ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Transaction Type</TableHead>
                            <TableHead>Amount $GO</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? <BalanceHistorySkeleton /> : currentTable && currentTable.length > 0 ? currentTable.map((transac) => (
                            <TableRow key={transac.id} className='text-muted-foreground hover:text-foreground'>
                                <TableCell>{transac.month}</TableCell>
                                <TableCell>{transac.id.substring(0, 10)}....</TableCell>
                                <TableCell>
                                    {
                                        new Date(transac.date).toLocaleString('en-US', {
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
                                <TableCell>{transac.type}</TableCell>
                                <TableCell>
                                    {
                                        transac.type === 'Withdrawal' ? `(${transac.amount})` : transac.amount
                                    }
                                </TableCell>
                            </TableRow>
                        )) :
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

const BalanceHistorySkeleton = () => {

    return (
        <>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(skeleton => (
                <TableRow key={skeleton}>
                        <TableCell>
                            <Skeleton className='w-6 h-5 rounded-3xl' />
                        </TableCell>
                        <TableCell>
                            <Skeleton className='w-36 h-5 rounded-3xl' />
                        </TableCell>
                        <TableCell>
                            <Skeleton className='w-52 h-5 rounded-3xl' />
                        </TableCell>
                        <TableCell>
                            <Skeleton className='w-28 h-5 rounded-3xl' />
                        </TableCell>
                        <TableCell>
                            <Skeleton className='w-20 h-5 rounded-3xl' />
                        </TableCell>
                </TableRow>
            ))}
        </>
    )
}

export default BalanceHistory