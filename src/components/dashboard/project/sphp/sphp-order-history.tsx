'use client'
import React, { useEffect, useState } from 'react'
import { socket } from '@/lib/socket'
import { ORDERSTATUS } from '@/constant/order'
import { trpc } from '@/app/_trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import TableServerPagination from '../../table-server-pagination'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import Link from 'next/link'
import DisplayClientMessages from '../../messages/display-client-messages'
const SPHPOrderHistory = ({ filter }: {
    filter: {
        status: string | undefined;
        request_chat: string;
    }
}) => {

    const [page, setPage] = useQueryState('page', parseAsString.withDefault('1'))

    const { data } = trpc.token.getUserAllSphpOrder.useQuery({
        page: page,
        status: filter.status,
        request_chat: filter.request_chat
    })

    const [currentTable, setCurrentTable] = useState(data?.data)

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

        setCurrentTable(data?.data)

    }, [data?.data])


    return (

        <div className='py-28 padding flex flex-col gap-10'>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <Link href={'/dashboard/project'}>
                            Project
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>SPHP Orders</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            {/* <FilterOrderHistory planID={params.planID} filter={filter} /> */}
            <>
                <Card>
                    <CardContent className='flex flex-col gap-5'>
                        <Table>
                            <TableHeader>
                                <TableRow className='text-xs md:text-sm'>
                                    <TableHead className='min-w-32'>Operation</TableHead>
                                    <TableHead className='min-w-32'>Amount (sPHP)</TableHead>
                                    <TableHead className='min-w-32'>Status</TableHead>
                                    <TableHead className='min-w-32'>Receipt</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {
                                    currentTable && currentTable.length > 0 ? currentTable.map((order, i) => (
                                        <TableRow key={order.id} className='text-muted-foreground hover:text-foreground text-xs md:text-sm'>
                                            <TableCell>
                                                <DisplayClientMessages orderType='sphp' orderID={order.id} unseen={order.user_unread_messages} />
                                            </TableCell>
                                            <TableCell>{order.amount}</TableCell>
                                            <TableCell>
                                                {returnStatusButton(order.status)}
                                            </TableCell>
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
        </div>
    )
}

export default SPHPOrderHistory