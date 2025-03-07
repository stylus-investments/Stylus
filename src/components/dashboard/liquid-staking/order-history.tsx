'use client'
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import React, { useEffect, useState } from 'react'
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ORDERSTATUS } from '@/constant/order';
import PayInvestmentPlan from '../investment-plan/pay-investment';
import DisplayClientMessages from '../messages/display-client-messages';
import { socket } from '@/lib/socket';
import TableServerPagination from '../table-server-pagination';
import { trpc } from '@/app/_trpc/client';
import { Skeleton } from '@/components/ui/skeleton';

type tProps = {
    plan_id: string
    pagination: {
        page: string | undefined;
    }
}

const OrderHistory = (props: tProps) => {

    const { data } = trpc.investment.retrieveSinglePlan.useQuery({
        plan_id: props.plan_id,
        page: props.pagination.page
    })

    const [currentTable, setCurrentTable] = useState(data?.data.payments)

    const returnStatusButton = (status: string) => {
        switch (status) {
            case ORDERSTATUS['processing']:
                return <Button className='h-7'>Processing</Button>
            case ORDERSTATUS['unpaid']:
                return <Button className='h-7' variant={'destructive'}>Unpaid</Button>
            case ORDERSTATUS['upcoming']:
                return <Button className='h-7 bg-blue-500'>Upcoming</Button>
            case ORDERSTATUS['paid']:
                return <Button className='h-7 bg-green-500'>Paid</Button>
        }
        return status
    }

    useEffect(() => {

        socket.on("unseen_message", ({ orderID }) => {
            if (currentTable) {
                setCurrentTable(prev =>
                    prev?.map(order =>
                        order.id === orderID
                            ? { ...order, user_unread_messages: order.user_unread_messages + 1 }
                            : order
                    )
                )
            }
        })

        return () => {
            socket.off("unseen_message")
            socket.disconnect()
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {

        setCurrentTable(data?.data.payments)

    }, [data?.data.payments])

    return (
        <>
            <Card>
                <CardContent className='flex flex-col gap-5'>
                    <Table>
                        <TableHeader>
                            <TableRow className='text-xs md:text-sm'>
                                <TableHead className='min-w-32'>Operation</TableHead>
                                <TableHead className='min-w-32'>Amount (sBTC)</TableHead>
                                <TableHead className='min-w-32'>Status</TableHead>
                                <TableHead className=' min-w-52'>Due Date</TableHead>
                                <TableHead className=' min-w-52'>Paid At</TableHead>
                                <TableHead className='min-w-32'>Receipt</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                currentTable && currentTable.length > 0 ? currentTable.map((order, i) => (
                                    <TableRow key={order.id} className='text-muted-foreground hover:text-foreground text-xs md:text-sm'>
                                        <TableCell>
                                            {order.status === ORDERSTATUS['unpaid'] ?
                                                <PayInvestmentPlan
                                                    investmentPrice={data?.data.total_price || 0}
                                                    orderID={order.id}
                                                    currency="PHP"
                                                />
                                                :
                                                order.status === ORDERSTATUS['upcoming'] ? "upcoming" :
                                                    <DisplayClientMessages orderType='sbtc' orderID={order.id} unseen={order.user_unread_messages} />
                                            }
                                        </TableCell>
                                        <TableCell>{order.amount}</TableCell>
                                        <TableCell>
                                            {returnStatusButton(order.status)}
                                        </TableCell>
                                        <TableCell>{new Date(order.created_at).toDateString()}</TableCell>
                                        <TableCell>{order.status === ORDERSTATUS['paid'] ? new Date(order.updated_at).toLocaleString() : ""}</TableCell>
                                        <TableCell>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button className='h-7'>View</Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className='w-full max-w-96'>
                                                    {order.receipt ? <Image src={order.receipt} alt='Order Receipt' width={200} height={50} className='w-full h-auto' /> : "No Receipt"}
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className='w-full'>
                                                            Close
                                                        </AlertDialogCancel>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>

                                    </TableRow>
                                )) :
                                    currentTable && currentTable.length === 0 ?
                                        <TableRow>
                                            <TableCell>No Data</TableCell>
                                        </TableRow>
                                        :
                                        [1, 2, 3, 4, 5].map(item => (
                                            <TableRow key={item}>
                                                <TableCell>
                                                    <Skeleton className='h-6 w-16' />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className='h-6 w-24' />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className='h-6 w-32' />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className='h-6 w-44' />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className='h-6 w-44' />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className='h-6 w-20' />
                                                </TableCell>
                                            </TableRow>
                                        ))
                            }
                        </TableBody>
                    </Table>
                    <TableServerPagination pagination={data?.pagination} />
                </CardContent>
            </Card >
        </>
    )
}

export default OrderHistory