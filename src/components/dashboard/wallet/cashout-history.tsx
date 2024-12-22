'use client'
import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import usePaginationStore from '@/state/paginationStore';
import { Card, CardContent } from '@/components/ui/card';
import TablePagination from '../table-pagination';
import { trpc } from '@/app/_trpc/client';
import { type RouterOutputs } from '@/types/apiTypes';
import useGlobalStore from '@/state/globalStore';

type CashoutTableType = RouterOutputs['cashout']['qCashoutHistory']

const CashoutHistory = () => {

    const { data, isLoading } = trpc.cashout.qCashoutHistory.useQuery(undefined, {
        refetchOnMount: false
    })

    const { copyText } = useGlobalStore()

    const [currentTable, setCurrentTable] = useState<CashoutTableType | undefined>(undefined)

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
        <div>
            <Card>
                <CardContent className='flex flex-col gap-2'>
                    <Table>
                        <TableHeader>
                            <TableRow className='text-xs sm:text-sm'>
                                <TableHead className='min-w-36'>Transaction Hash</TableHead>
                                <TableHead className='min-w-28'>Status</TableHead>
                                <TableHead className='min-w-44'>Account Name</TableHead>
                                <TableHead className='min-w-44'>Account Number</TableHead>
                                <TableHead className='min-w-36'>Payment Method</TableHead>
                                <TableHead className='min-w-36'>Amount</TableHead>
                                <TableHead className='min-w-56'>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentTable && currentTable.length > 0 ?
                                currentTable.map((obj) => (
                                    <TableRow key={obj.id} className='text-muted-foreground hover:text-foreground text-xs md:text-sm'>
                                        <TableCell onClick={() => copyText(obj.transaction_hash)} className='cursor-pointer'>
                                            {obj.transaction_hash.substring(0, 10)}....
                                        </TableCell>
                                        <TableCell>{obj.status}</TableCell>
                                        <TableCell>{obj.account_name}</TableCell>
                                        <TableCell>{obj.account_number}</TableCell>
                                        <TableCell>{obj.payment_method}</TableCell>
                                        <TableCell>{obj.amount}</TableCell>
                                        <TableCell>{new Date(obj.created_at).toLocaleString()}</TableCell>
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
        </div>
    )
}

export default CashoutHistory