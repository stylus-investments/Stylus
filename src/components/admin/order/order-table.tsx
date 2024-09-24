'use client'
import TablePagination from '@/components/dashboard/table-pagination'
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { TableCaption, TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '@/components/ui/table'
import usePaginationStore from '@/state/paginationStore'
import { user_order } from '@prisma/client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import DisplayAdminMessages from './display-admin-message'
import { socket } from '@/lib/socket'
import { ORDERSTATUS } from '@/constant/order'

const OrderTable = ({ orders }: {
    orders: user_order[]
}) => {

    const [ordersData, setOrdersData] = useState(orders)

    const [currentTable, setCurrentTable] = useState<user_order[] | undefined>(undefined)

    const { getCurrentData, currentPage } = usePaginationStore()

    useEffect(() => {

        socket.connect()
        socket.on("newOrder", (data) => {
            setOrdersData(prev => [...prev!, data]);
        })
        socket.on("admin_unseen_messages", (data) => {
            const orderID = data
            setOrdersData(prev =>
                prev.map(order =>
                    order.id === orderID
                        ? { ...order, admin_unread_messages: order.admin_unread_messages + 1 }
                        : order
                )
            );
        })

        return () => {
            socket.off('newOrder')
            socket.off("admin_unseen_messages")
            socket.disconnect()
        }
    }, [])

    useEffect(() => {
        setCurrentTable(getCurrentData(ordersData))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ordersData, currentPage])
    return (
        <div className='padding py-28 flex flex-col gap-10'>
            <Table >
                <TableCaption>A list of orders.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount (STXBTC)</TableHead>
                        <TableHead>Messages</TableHead>
                        <TableHead>Receipt</TableHead>
                        <TableHead>Method</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentTable && currentTable.map(order => (
                        <TableRow key={order.id}>
                            <TableCell>{order.status}</TableCell>
                            <TableCell>{order.amount}</TableCell>
                            <TableCell>
                                {order.status !== (ORDERSTATUS['inactive'] || ORDERSTATUS['upcoming']) ? <DisplayAdminMessages orderID={order.id} unseen={order.admin_unread_messages} /> : order.status}
                            </TableCell>
                            <TableCell>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button className='h-7' variant={'secondary'}>View</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className='w-full max-h-[600px] overflow-y-auto'>
                                        <Image src={order.receipt} alt='Order Receipt' width={200} height={50} className='w-full h-auto' />
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className='w-full'>
                                                Close
                                            </AlertDialogCancel>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                            <TableCell>{order.method}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <TablePagination data={ordersData || []} />
        </div>
    )
}

export default OrderTable