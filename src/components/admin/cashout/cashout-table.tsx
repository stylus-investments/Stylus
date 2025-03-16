'use client'
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '@/components/ui/table'
import React from 'react'
import { caller } from '@/app/_trpc/server'
import TableServerPagination from '@/components/dashboard/table-server-pagination'
import useGlobalStore from '@/state/globalStore'
import { cashout_status } from '@prisma/client'
import FilterCashoutTable from './filter-cashout-table'
import UpdateCashout from './update-cashout'
import { Button } from '@/components/ui/button'

const CashoutTable = ({ cashoutList, filter }: {
    cashoutList: Awaited<ReturnType<typeof caller['cashout']['qCashoutList']>>
    filter: {
        status: cashout_status | undefined
    }
}) => {

    const returnStatusButton = (status: string) => {

        switch (status) {
            case cashout_status['PENDING']:
                return <Button className='h-7' variant={'secondary'}>Pending</Button>
            case cashout_status['FAILED']:
                return <Button className='h-7' variant={'destructive'}>Invalid</Button>
            case cashout_status['COMPLETED']:
                return <Button className='h-7'>Completed</Button>
        }
    }

    const { copyText } = useGlobalStore()
    return (
        <div className='padding py-24 flex flex-col gap-10'>
            <FilterCashoutTable filter={filter} />
            <Table>
                <TableHeader>
                    <TableRow className='text-xs sm:text-sm'>
                        <TableHead className='min-w-32'>Transaction Hash</TableHead>
                        <TableHead className='min-w-24'>Status</TableHead>
                        <TableHead className='min-w-40'>Account Name</TableHead>
                        <TableHead className='min-w-40'>Account Number</TableHead>
                        <TableHead className='min-w-36'>Payment Method</TableHead>
                        <TableHead className='min-w-28'>Amount</TableHead>
                        <TableHead className='min-w-24'>Date</TableHead>
                        <TableHead className='min-w-24'>Operation</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cashoutList.data.length > 0 ?
                        cashoutList.data.map((obj) => (
                            <TableRow key={obj.id} className='text-muted-foreground hover:text-foreground text-xs md:text-sm'>
                                <TableCell onClick={() => copyText(obj.transaction_hash)} className='cursor-pointer'>
                                    {obj.transaction_hash.substring(0, 10)}....
                                </TableCell>
                                <TableCell>{returnStatusButton(obj.status)}</TableCell>
                                <TableCell>{obj.account_name}</TableCell>
                                <TableCell>{obj.account_number}</TableCell>
                                <TableCell>{obj.payment_method}</TableCell>
                                <TableCell>{obj.amount}</TableCell>
                                <TableCell>{new Date(obj.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    {obj.status === cashout_status.PENDING && <UpdateCashout data={obj} />}
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
            <TableServerPagination pagination={cashoutList.pagination} />
        </div>
    )
}

export default CashoutTable