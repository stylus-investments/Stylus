import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import React from 'react'
import TablePagination from '../table-pagination'

export const BalanceHistorySkeleton = () => {

    return (
        <Card>
            <CardContent className='flex flex-col gap-5'>
                <Table>
                    <TableCaption>SAVE Transaction History</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Amount SAVE</TableHead>
                            <TableHead>Transaction Type</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Transaction ID</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 19].map(row => (
                            <TableRow key={row} className='text-muted-foreground hover:text-foreground'>
                                <TableCell>
                                    <Skeleton className='w-7 h-6 rounded-3xl' />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className='w-32 h-6 rounded-3xl' />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className='w-28 h-6 rounded-3xl' />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className='w-64 h-6 rounded-3xl' />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className='w-72 h-6 rounded-3xl' />
                                </TableCell>

                            </TableRow>
                        ))
                        }
                    </TableBody>
                </Table>
                <TablePagination data={[]} />
            </CardContent>
        </Card>
    )
}

export default BalanceHistorySkeleton