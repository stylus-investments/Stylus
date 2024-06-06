'use client'
import { caller } from '@/app/_trpc/server'
import TablePagination from '@/components/dashboard/table-pagination'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import useGlobalStore from '@/state/globalStore'
import usePaginationStore from '@/state/paginationStore'
import React, { useEffect, useState } from 'react'

interface SnapshotTableProps {
    userData: Awaited<ReturnType<(typeof caller['user']['getAll'])>>
}

const UsersTable: React.FC<SnapshotTableProps> = ({ userData }) => {

    const { copyText } = useGlobalStore()
    const { getCurrentData, currentPage } = usePaginationStore()
    const [currentTable, setCurrentTable] = useState<{
        snapshots: undefined;
        forfiet_count: number;
        total_snapshots: number;
        id: number;
        created_at: Date;
        wallet: string;
    }[] | undefined>(userData)

    useEffect(() => {

        setCurrentTable(getCurrentData(userData))

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData, currentPage])

    return (
        <div className='container pt-20 flex flex-col gap-8'>
            <Table>
                <TableCaption>User List</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Wallet Address</TableHead>
                        <TableHead>Total Snapshots</TableHead>
                        <TableHead>Forfiet Count</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Operation</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentTable && currentTable.length > 0 ? currentTable.map(data => (
                        <TableRow key={data.id} className='text-muted-foreground hover:text-foreground'>
                            <TableCell className="font-medium">{data.id}</TableCell>
                            <TableCell className='cursor-pointer' onClick={() => copyText(data.wallet)}>
                                {`${data.wallet.substring(0, 6)}...${data.wallet.substring(38)}`}
                            </TableCell>                            <TableCell>{data.total_snapshots}</TableCell>
                            <TableCell>{data.forfiet_count}</TableCell>
                            < TableCell> {data.created_at.toLocaleString()}</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    )) :
                        <TableRow>
                            <TableCell>No Data</TableCell>
                        </TableRow>
                    }
                </TableBody>
            </Table>
            <TablePagination data={userData} />
        </div >
    )
}

export default UsersTable