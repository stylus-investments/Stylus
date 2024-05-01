import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import usePaginationStore from '@/state/paginationStore';
import React, { useEffect, useState } from 'react'
import TablePagination from '../table-pagination';
import { trpc } from '@/app/_trpc/client';
import BalanceHistorySkeleton from './balance-history-skeleton';

const BalanceHistory = ({ address }: { address: string }) => {

    const { data, isLoading } = trpc.dashboard.getGoTokenBalanceHistory.useQuery(address, {
        refetchOnMount: false
    })

    const [currentTable, setCurrentTable] = useState<{
        number: number;
        id: string;
        type: string;
        date: string;
        amount: string;
    }[] | undefined>(undefined)

    const { getCurrentData, currentPage } = usePaginationStore()

    useEffect(() => {

        setCurrentTable(getCurrentData(data))

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, currentPage])

    return (
        <>
            {isLoading ? <BalanceHistorySkeleton /> :
                <Card>
                    <CardContent className='flex flex-col gap-5'>
                        <Table>
                            <TableCaption>$GO Transaction History</TableCaption>
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
                                {currentTable && currentTable.length > 0 ? currentTable.map((transac) => (
                                    <TableRow key={transac.id} className='text-muted-foreground hover:text-foreground'>
                                        <TableCell>{transac.number}</TableCell>
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
            }
        </>
    )
}



export default BalanceHistory