'use client'
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import React, { useEffect, useState } from 'react'
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { caller } from '@/app/_trpc/server';
import { ORDERSTATUS } from '@/constant/order';
import PayInvestmentPlan from '../investment-plan/pay-investment';
import DisplayClientMessages from '../messages/display-client-messages';
import { socket } from '@/lib/socket';
import TableServerPagination from '../table-server-pagination';

const OrderHistory = ({ initialData }: {
    initialData: Awaited<ReturnType<typeof caller['investment']['retrieveSinglePlan']>>
}) => {

    const [currentTable, setCurrentTable] = useState(initialData.data.payments)

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
            setCurrentTable(prev =>
                prev.map(order =>
                    order.id === orderID
                        ? { ...order, user_unread_messages: order.user_unread_messages + 1 }
                        : order
                )
            )
        })

        return () => {
            socket.off("unseen_message")
            socket.disconnect()
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {

        setCurrentTable(initialData.data.payments)

    }, [initialData.data.payments])

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
                            {currentTable && currentTable.length > 0 ? currentTable.map((order, i) => (
                                <TableRow key={order.id} className='text-muted-foreground hover:text-foreground text-xs md:text-sm'>
                                    <TableCell>
                                        {order.status === ORDERSTATUS['unpaid'] ?
                                            <PayInvestmentPlan
                                                investmentPrice={initialData.data.total_price}
                                                orderID={order.id}
                                                currency="PHP"
                                            />
                                            :
                                            order.status === ORDERSTATUS['upcoming'] ? "upcoming" :
                                                <DisplayClientMessages orderID={order.id} unseen={order.user_unread_messages} />
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
                                <TableRow>
                                    <TableCell>No Data</TableCell>
                                </TableRow>
                            }
                        </TableBody>
                    </Table>
                    <TableServerPagination pagination={initialData.pagination} />
                </CardContent>
            </Card >
        </>
    )
}

export default OrderHistory