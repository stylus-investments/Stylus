'use client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import usePaginationStore from '@/state/paginationStore';
import React, { useEffect, useState } from 'react'
import TablePagination from '../table-pagination';
import { trpc } from '@/app/_trpc/client';
import BalanceHistorySkeleton from '../liquid-staking/balance-history-skeleton';

const AssetHistory = ({ tokenAddress }: {
    tokenAddress: string
}) => {

    const { data, isLoading } = trpc.dashboard.getTokenBalanceHistory.useQuery(tokenAddress)
    const { data: tokenData } = trpc.dashboard.getAssetData.useQuery(tokenAddress, {
        enabled: false
    })

    const [currentTable, setCurrentTable] = useState<{
        number: number;
        id: string;
        type: string;
        date: string;
        amount: string;
    }[] | undefined>(undefined)

    const { getCurrentData, currentPage } = usePaginationStore()

    useEffect(() => {

        setCurrentTable(getCurrentData(data))

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, currentPage])

    return (
        <>
            {isLoading ? <BalanceHistorySkeleton /> :
                <>
                    <Table>
                        <TableHeader>
                            <TableRow className='text-xs md:text-sm'>
                                <TableHead className='w-5'>#</TableHead>
                                <TableHead className='min-w-32'>Amount {tokenData?.name}</TableHead>
                                <TableHead className='min-w-32'>Transaction Type</TableHead>
                                <TableHead className=' min-w-52'>Date</TableHead>
                                <TableHead className='min-w-32'>Transaction ID</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentTable && currentTable.length > 0 ? currentTable.map((transac) => (
                                <TableRow key={transac.id} className='text-muted-foreground hover:text-foreground text-xs md:text-sm'>
                                    <TableCell>{transac.number}</TableCell>
                                    <TableCell>
                                        {
                                            transac.type === 'Withdrawal' ? `(${transac.amount})` : transac.amount
                                        }
                                    </TableCell>
                                    <TableCell>{transac.type}</TableCell>
                                    <TableCell>
                                        {
                                            new Date(transac.date).toLocaleString('en-US', {
                                                timeZone: 'UTC',
                                                weekday: 'short',
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })
                                        }  UTC
                                    </TableCell>
                                    <TableCell>
                                        {transac.id.substring(0, 10)}....
                                    </TableCell>
                                </TableRow>
                            )) :
                                <TableRow>
                                    <TableCell>No Data</TableCell>
                                </TableRow>
                            }
                        </TableBody>
                    </Table>
                    <div className='w-full text-center text-xs sm:text-sm text-muted-foreground'>{tokenData?.name} Transaction History</div>
                    <TablePagination data={data || []} />
                </>
            }
        </>
    )
}

export default AssetHistory