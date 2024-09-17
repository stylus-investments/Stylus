'use client'
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import usePaginationStore from '@/state/paginationStore';
import React, { useEffect, useState } from 'react'
import TablePagination from '../table-pagination';
import { user_order } from '@prisma/client';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { caller } from '@/app/_trpc/server';
import { ORDERSTATUS } from '@/constant/order';
import PayInvestmentPlan from '../investment-plan/pay-investment';
import DisplayClientMessages from '../messages/display-client-messages';
import { socket } from '@/lib/socket';
import { trpc } from '@/app/_trpc/client';

const OrderHistory = ({ initialData, user_id }: {
    initialData: Awaited<ReturnType<typeof caller['investment']['retrieveSinglePlan']>>
    user_id: string
}) => {

    const { data } = trpc.investment.retrieveSinglePlan.useQuery(initialData.id, {
        enabled: false,
        initialData: initialData
    })

    const [ordersData, setOrdersData] = useState(data.payments)
    const [currentTable, setCurrentTable] = useState<user_order[] | undefined>(undefined)
    const { getCurrentData, currentPage } = usePaginationStore()

    useEffect(() => {

        socket.connect()
        socket.emit("stanbyOrder", { user_id })
        socket.on("user_unseen_messages", (data) => {
            const orderID = data
            setOrdersData(prev =>
                prev.map(order =>
                    order.id === orderID
                        ? { ...order, user_unread_messages: order.user_unread_messages + 1 }
                        : order
                )
            );
        })

        return () => {
            socket.off("stanbyOrder")
            socket.off("user_unseen_messages")
            socket.disconnect()
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        setOrdersData(data.payments)
    }, [data])

    useEffect(() => {

        setCurrentTable(getCurrentData(ordersData))

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ordersData, currentPage])

    return (
        <>
            <Card>
                <CardContent className='flex flex-col gap-5'>
                    <Table>
                        <TableHeader>
                            <TableRow className='text-xs md:text-sm'>
                                <TableHead className='min-w-32'>Operation</TableHead>
                                <TableHead className='min-w-32'>Amount (STXBTC)</TableHead>
                                <TableHead className='min-w-32'>Status</TableHead>
                                <TableHead className=' min-w-52'>Payment Method</TableHead>
                                <TableHead className='min-w-32'>Receipt</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentTable && currentTable.length > 0 ? currentTable.map((order, i) => (
                                <TableRow key={order.id} className='text-muted-foreground hover:text-foreground text-xs md:text-sm'>
                                    <TableCell>
                                        {order.status === ORDERSTATUS['unpaid'] ?
                                            <PayInvestmentPlan
                                                investmentPrice={initialData.total_price}
                                                orderID={order.id}
                                                currency="PHP"
                                                investmentPlanID={initialData.id}
                                            />
                                            :
                                            <DisplayClientMessages orderID={order.id} unseen={order.user_unread_messages} />
                                        }
                                    </TableCell>
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

                                </TableRow>
                            )) :
                                <TableRow>
                                    <TableCell>No Data</TableCell>
                                </TableRow>
                            }
                        </TableBody>
                    </Table>
                    <div className='w-full text-center text-xs sm:text-sm text-muted-foreground'>Order History</div>
                    <TablePagination data={ordersData || []} />
                </CardContent>
            </Card >
        </>
    )
}



export default OrderHistory