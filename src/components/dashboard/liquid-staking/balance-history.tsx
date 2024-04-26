import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import usePaginationStore from '@/state/paginationStore';
import React, { useEffect, useState } from 'react'
import TablePagination from '../table-pagination';

const BalanceHistory = ({ history }: {
    history: {
        id: string;
        type: string;
        date: string;
        amount: string;
    }[]
}) => {

    const [currentTable, setCurrentTable] = useState<any[] | null>(null)

    const { getCurrentData, currentPage } = usePaginationStore()

    useEffect(() => {

        setCurrentTable(getCurrentData(history))

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [history, currentPage])

    return (
        <Card>
            <CardContent className='flex flex-col gap-5'>
                <Table>
                    <TableCaption>Go Transaction History</TableCaption>
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
                        {currentTable && currentTable.length > 0 ? currentTable.map((transac, index) => (
                            <TableRow key={transac.id} className='text-muted-foreground hover:text-foreground'>
                                <TableCell>{index + 1}</TableCell>
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
                <TablePagination data={history} />
            </CardContent>
        </Card>

    )
}

export default BalanceHistory