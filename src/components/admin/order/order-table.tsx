import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { TableCaption, TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '@/components/ui/table'
import { user_order } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const OrderTable = ({ orders }: {
    orders: user_order[]
}) => {
    return (
        <div className='padding pt-20'>
            <Table >
                <TableCaption>A list of orders.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Amount (STXBTC)</TableHead>
                        <TableHead>Receipt</TableHead>
                        <TableHead>Messages</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map(order => (
                        <TableRow key={order.id}>
                            <TableCell>{order.status}</TableCell>
                            <TableCell>{order.method}</TableCell>
                            <TableCell>{order.currency} - {order.price}</TableCell>
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
                                <Button className="h-7">
                                    <Link href={`/admin/order/message/${order.id}`}>Message</Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default OrderTable