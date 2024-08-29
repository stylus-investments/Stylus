'use client'
import { trpc } from '@/app/_trpc/client'
import TablePagination from '@/components/dashboard/table-pagination'
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { TableCaption, TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '@/components/ui/table'
import usePaginationStore from '@/state/paginationStore'
import { user_order } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

const OrderTable = ({ orders }: {
    orders: user_order[]
}) => {

    const { data, isLoading } = trpc.order.getAllOrder.useQuery(undefined, {
        initialData: orders as any,
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
        <div className='padding pt-28 flex flex-col gap-10'>
            <Table >
                <TableCaption>A list of orders.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Amount (STXBTC)</TableHead>
                        <TableHead>Receipt</TableHead>
                        <TableHead>Messages</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentTable && currentTable.map(order => (
                        <TableRow key={order.id}>
                            <TableCell>{order.status}</TableCell>
                            <TableCell>{order.method}</TableCell>
                            <TableCell>{order.amount}</TableCell>
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
                            <TableCell>
                                <Link href={`/admin/order/message/${order.id}`} className='w-full relative h-7'>
                                    <Button className='h-full w-full'>
                                        Chat
                                    </Button>
                                    {order.admin_unread_messages ?
                                        <div className=' absolute bg-destructive text-white px-2 py-1 shadow-2xl text-xs rounded-br-full rounded-t-full -right-4 -top-4'>{order.admin_unread_messages}</div>
                                        : null
                                    }
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <TablePagination data={data || []} />
        </div>
    )
}

export default OrderTable