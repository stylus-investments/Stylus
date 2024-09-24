'use client'
import { caller } from '@/app/_trpc/server'
import TableServerPagination from '@/components/dashboard/table-server-pagination'
import { Button } from '@/components/ui/button'
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '@/components/ui/table'
import { ProfileStatus, } from '@prisma/client'
import { useRouter } from 'next/navigation'

const UsersTable = ({ users }: {
    users: Awaited<ReturnType<typeof caller['user']['getAllUsers']>>
}) => {

    const router = useRouter()

    const handleStatusChange = (status: string) => {
        const url = new URL(window.location.href);
        if (status) {
            url.searchParams.set('status', status); // Set the new page value
        } else {
            url.searchParams.delete("status")
        }
        url.searchParams.set('page', '1'); // Reset to the first page on status change
        router.push(url.toString()); // Navigate to the updated URL
    };

    const returnUserStats = (status: string) => {

        switch (status) {
            case ProfileStatus['PENDING']:
                return <Button className='h-7' variant={'secondary'}>Pending</Button>
            case ProfileStatus['INVALID']:
                return <Button className='h-7' variant={'destructive'}>Invalid</Button>
            case ProfileStatus['VERIFIED']:
                return <Button className='h-7'>Verified</Button>
        }
    }


    return (
        <div className='padding py-28 flex flex-col gap-10'>
            <div className="flex justify-between">
                <div>
                    <label htmlFor="status-filter">Filter by Status: </label>
                    <select
                        id="status-filter"
                        onChange={(e) => handleStatusChange(e.target.value)}
                        value={users.filter.status || ''}
                    >
                        <option value="">All</option>
                        <option value={ProfileStatus.PENDING}>Pending</option>
                        <option value={ProfileStatus.VERIFIED}>Verified</option>
                        <option value={ProfileStatus.INVALID}>Invalid</option>
                    </select>
                </div>

            </div>
            <Table >
                <TableHeader>
                    <TableRow>
                        <TableHead className='w-52'>Name</TableHead>
                        <TableHead className='w-32'>Status</TableHead>
                        <TableHead className='w-52'>Email</TableHead>
                        <TableHead className='w-36'>Phone #</TableHead>
                        <TableHead className='w-36'>Age</TableHead>
                        <TableHead className='w-44'>Created At</TableHead>
                        <TableHead className='text-right'>Operation</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.data.length > 0 ? users.data.map(user => (
                        <TableRow key={user.user_id}>
                            <TableCell onClick={() => {
                            }}>
                                {user.first_name} {user.last_name}
                            </TableCell>
                            <TableCell>
                                {returnUserStats(user.status)}
                            </TableCell>
                            <TableCell>
                                {user.email}
                            </TableCell>
                            <TableCell>
                                {user.mobile}
                            </TableCell>
                            <TableCell>
                                {user.age}
                            </TableCell>
                            <TableCell>
                                {new Date(user.created_at).toDateString()}
                            </TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    )) :
                        <TableRow>
                            <TableCell>No Data</TableCell>
                        </TableRow>
                    }
                </TableBody>
            </Table>
            <TableServerPagination pagination={users.pagination} />
        </div>
    )
}

export default UsersTable