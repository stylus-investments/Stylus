'use client'
import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import usePaginationStore from '@/state/paginationStore';
import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/app/_trpc/client';
import { Skeleton } from '@/components/ui/skeleton';
import { PaymentMethods } from '@prisma/client';
import TablePagination from '@/components/dashboard/table-pagination';
import { caller } from '@/app/_trpc/server';
import ConfirmPayout from './confirm-payout';

const PayoutRequestTable = ({ initialData }: {
    initialData: Awaited<ReturnType<typeof caller['referral']['getAllPayouts']>>
}) => {

    const { data, isLoading } = trpc.referral.getAllPayouts.useQuery(undefined, {
        refetchOnMount: false,
        initialData: initialData
    })

    const [currentTable, setCurrentTable] = useState<{
        amount: string
        id: string
        status: string
        payment_method: PaymentMethods
        payment_account_name: string
        payment_account_number: string
        created_at: string
    }[] | undefined>(undefined)

    const { getCurrentData, currentPage } = usePaginationStore()

    useEffect(() => {

        setCurrentTable(getCurrentData(data))

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, currentPage])

    return (
        <>
            {isLoading ? <PayoutRequestTablekeleton /> :
                <Card>
                    <CardContent className='flex flex-col gap-2'>
                        <Table>
                            <TableHeader>
                                <TableRow className='text-xs sm:text-sm'>
                                    <TableHead className='min-w-32'>Amount</TableHead>
                                    <TableHead className='min-w-32'>Status</TableHead>
                                    <TableHead className='min-w-28'>Method</TableHead>
                                    <TableHead className='min-w-40'>Account Name</TableHead>
                                    <TableHead className='min-w-40'>Account Number</TableHead>
                                    <TableHead className='min-w-40'>Date</TableHead>
                                    <TableHead className='min-w-40'>Operation</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentTable && currentTable.length > 0 ?
                                    currentTable.map((payout, i) => (
                                        <TableRow key={i} className='text-muted-foreground hover:text-foreground text-xs md:text-sm'>
                                            <TableCell>₱{payout.amount}</TableCell>
                                            <TableCell>{payout.status}</TableCell>
                                            <TableCell>{payout.payment_method}</TableCell>
                                            <TableCell>{payout.payment_account_name}</TableCell>
                                            <TableCell>{payout.payment_account_number}</TableCell>
                                            <TableCell>{new Date(payout.created_at).toDateString()}</TableCell>
                                            <TableCell>
                                                <ConfirmPayout payoutRequestData={payout} />
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

const PayoutRequestTablekeleton = () => {

    return (
        <Card>
            <CardContent className='flex flex-col gap-2'>
                <Table>
                    <TableHeader>
                        <TableRow className='text-xs sm:text-sm'>
                            <TableHead className='min-w-32'>Amount</TableHead>
                            <TableHead className='min-w-32'>Status</TableHead>
                            <TableHead className='min-w-28'>Method</TableHead>
                            <TableHead className='min-w-40'>Account Name</TableHead>
                            <TableHead className='min-w-40'>Account Number</TableHead>
                            <TableHead className='min-w-40'>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[1, 2, 3, 4, 5, 6, 7].map(skel => (
                            <TableRow key={skel} className='text-muted-foreground hover:text-foreground text-xs md:text-sm'>
                                <TableCell>
                                    <Skeleton className='w-32 h-7' />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className='w-32 h-7' />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className='w-28 h-7' />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className='w-40 h-7' />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className='w-40 h-7' />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className='w-40 h-7' />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className='w-full text-center text-xs sm:text-sm text-muted-foreground'>Referral Payout History</div>
                <TablePagination data={[]} />
            </CardContent>
        </Card>
    )
}

export default PayoutRequestTable