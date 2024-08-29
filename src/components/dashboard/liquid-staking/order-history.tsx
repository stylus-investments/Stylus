'use client'
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import usePaginationStore from '@/state/paginationStore';
import React, { useEffect, useState } from 'react'
import TablePagination from '../table-pagination';
import { trpc } from '@/app/_trpc/client';
import BalanceHistorySkeleton from './balance-history-skeleton';
import { user_order } from '@prisma/client';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

const OrderHistory = () => {

    const { data, isLoading } = trpc.order.getCurrentUserOrder.useQuery(undefined, {
        refetchOnMount: false,
        refetchInterval: 10000
    })

    const [currentTable, setCurrentTable] = useState<user_order[] | undefined>(undefined)

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
                            <TableHeader>
                                <TableRow className='text-xs md:text-sm'>
                                    <TableHead className='min-w-32'>Amount SAVE</TableHead>
                                    <TableHead className='min-w-32'>Status</TableHead>
                                    <TableHead className=' min-w-52'>Payment Method</TableHead>
                                    <TableHead className='min-w-32'>Receipt</TableHead>
                                    <TableHead className='min-w-32'>Messages</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentTable && currentTable.length > 0 ? currentTable.map((order, i) => (
                                    <TableRow key={order.id} className='text-muted-foreground hover:text-foreground text-xs md:text-sm'>
                                        <TableCell>{order.amount}</TableCell>
                                        <TableCell>{order.status}</TableCell>
                                        <TableCell>{order.method.toUpperCase()}</TableCell>
                                        <TableCell>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button className='h-7' variant={'secondary'}>View</Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className='w-full max-w-96'>
                                                    <Image src={order.receipt} alt='Order Receipt' width={200} height={50} className='w-full h-auto' />
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className='w-full'>
                                                            Close
                                                        </AlertDialogCancel>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/dashboard/wallet/order-message/${order.id}`} className='w-full relative h-7'>
                                                <Button className='h-full w-full'>
                                                    Chat
                                                </Button>
                                                {order.user_unread_messages ?
                                                    <div className=' absolute bg-destructive text-white px-2 py-1 shadow-2xl text-xs rounded-br-full rounded-t-full -right-4 -top-4'>{order.user_unread_messages}</div>
                                                    : null
                                                }
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                )) :
                                    <TableRow>
                                        <TableCell>No Data</TableCell>
                                    </TableRow>
                                }
                            </TableBody>
                        </Table>
                        <div className='w-full text-center text-xs sm:text-sm text-muted-foreground'>Save Order History</div>
                        <TablePagination data={data || []} />
                    </CardContent>
                </Card >
            }
        </>
    )
}



export default OrderHistory