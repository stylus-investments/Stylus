import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import React from 'react'

interface SnapshotTableProps {
    snapshotData: {
        session: undefined;
        total_holders: number;
        total_unpaid_holders: number;
        id: number;
        start_date: Date;
        end_date: Date;
        completed: boolean;
    }[]
}

const SnapshotsTable: React.FC<SnapshotTableProps> = (props) => {

    const { snapshotData } = props

    return (
        <div className='container py-20'>
            <Table>
                <TableCaption>Snapshot History</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead>Total Holders</TableHead>
                        <TableHead>Unpaid Holders</TableHead>
                        <TableHead>Operation</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {snapshotData.length > 0 ? snapshotData.map(data => (
                        <TableRow key={data.id}>
                            <TableCell className="font-medium">{data.id}</TableCell>
                            <TableCell>
                                {
                                    new Date(data.start_date).toLocaleString('en-US', {
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
                                {
                                    new Date(data.end_date).toLocaleString('en-US', {
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
                            <TableCell>{data.completed ? 'true' : 'false'}</TableCell>
                            < TableCell > {data.total_holders}</TableCell>
                            <TableCell>{data.total_unpaid_holders}</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    )) :
                        <TableRow>
                            <TableCell>No Data</TableCell>
                        </TableRow>
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default SnapshotsTable