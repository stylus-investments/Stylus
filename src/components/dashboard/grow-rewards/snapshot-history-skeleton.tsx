import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import React from 'react'
import TablePagination from '../table-pagination'
import { Skeleton } from '@/components/ui/skeleton'

const SnapshotHistorySkeleton = () => {
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
                    </TableBody>
                </Table>
                <TablePagination data={[]} />
            </CardContent>
        </Card>)
}

export default SnapshotHistorySkeleton