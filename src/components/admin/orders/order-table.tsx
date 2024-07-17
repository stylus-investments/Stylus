'use client'
import { caller } from '@/app/_trpc/server'
import usePaginationStore from '@/state/paginationStore'
import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import TablePagination from '@/components/dashboard/table-pagination'
import useGlobalStore from '@/state/globalStore'
import SearchOrder from './search-order'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsis, faXmark } from '@fortawesome/free-solid-svg-icons'
import { user_order } from '@prisma/client'
import CompletedOrderDialog from './completed-order-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import InvalidOrderDialog from './invalid-order-dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ORDERSTATUS } from '@/constant/order'
import { trpc } from '@/app/_trpc/client'
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface Props {
    orders: Awaited<ReturnType<(typeof caller['order']['getAll'])>>
}

interface OrderProps extends user_order {
    user: {
        id: number;
        wallet: string;
        email: string | null;
        phishing_code: string | null;
        email_confirmed: boolean;
        created_at: Date;
        updated_at: Date;
    };
}

export type { OrderProps }

const OrderTable = ({ orders }: Props) => {

    const { copyText } = useGlobalStore()
    const [open, setOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<OrderProps | null>(null)
    const { getCurrentData, currentPage } = usePaginationStore()
    const { data: orderData } = trpc.order.getAll.useQuery(undefined, {
        refetchOnMount: false,
        initialData: orders as any
    })
    const [currentTable, setCurrentTable] = useState<OrderProps[] | undefined>(orderData as any)
    const [searchQuery, setSearchQuery] = useState({
        wallet_address: '',
        method: '',
        status: 'processing'
    })

    const filteredTable = orderData && orderData.length && orderData.filter(order => {
        const searchWalletAddress = searchQuery.wallet_address.toUpperCase();
        const searchPaymentMethod = searchQuery.method.toUpperCase();
        const searchStatus = searchQuery.status.toUpperCase();
        return (
            (searchWalletAddress === '' || order.user.wallet.toUpperCase().includes(searchWalletAddress)) &&
            (searchPaymentMethod === '' || order.method.toUpperCase().includes(searchPaymentMethod)) &&
            (searchStatus === '' || order.status.toUpperCase().includes(searchStatus))
        )
    })

    useEffect(() => {

        setCurrentTable(getCurrentData(filteredTable || []))

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderData, currentPage, searchQuery])

    return (
        <div className='container pt-20 flex flex-col gap-8'>
            <SearchOrder
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery} />
            <Table>
                <TableCaption>Order List</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Amount (SAVE)</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Wallet Address</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Receipt</TableHead>
                        <TableHead>Operation</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentTable && currentTable.length > 0 ? currentTable.map(data => (
                        <TableRow key={data.id} className='text-muted-foreground hover:text-foreground'>
                            <TableCell className='uppercase'>{data.method}</TableCell>
                            <TableCell className='cursor-pointer' onClick={() => copyText(data.amount)}>{data.amount}</TableCell>
                            <TableCell>{data.price}</TableCell>
                            <TableCell className='cursor-pointer' onClick={() => copyText(data.user.wallet)}>
                                {`${data.user.wallet.substring(0, 6)}...${data.user.wallet.substring(38)}`}
                            </TableCell>
                            <TableCell>{data.status}</TableCell>
                            < TableCell> {data.created_at.toLocaleString()}</TableCell>
                            <TableCell>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button className='h-7'>View</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className='w-full max-w-96'>
                                        <Image src={data.receipt} alt='Order Receipt' width={200} height={50} className='w-full h-auto' />
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className='w-full'>
                                                Close
                                            </AlertDialogCancel>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                            <TableCell>
                                {data.status === ORDERSTATUS['processing'] && <DropdownMenu open={open && selectedOrder && selectedOrder.id === data.id ? true : false} onOpenChange={setOpen}>
                                    <DropdownMenuTrigger asChild onClick={() => setSelectedOrder(data)}>
                                        <FontAwesomeIcon icon={faEllipsis} width={16} height={16} className='cursor-pointer text-lg' />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className='flex flex-col p-1 w-44'>
                                        <Label className='text-base p-2'>Operation</Label>
                                        <Separator />
                                        <CompletedOrderDialog order={data} />
                                        <InvalidOrderDialog order={data} />
                                        <DropdownMenuItem>
                                            Close
                                            <DropdownMenuShortcut>
                                                <FontAwesomeIcon icon={faXmark} width={16} height={16} />
                                            </DropdownMenuShortcut>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>}
                            </TableCell>
                        </TableRow>
                    )) :
                        <TableRow>
                            <TableCell>No Data</TableCell>
                        </TableRow>
                    }
                </TableBody>
            </Table>
            <TablePagination data={orders} />
        </div >
    )
}

export default OrderTable