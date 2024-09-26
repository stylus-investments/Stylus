import { caller } from '@/app/_trpc/server'
import TableServerPagination from '@/components/dashboard/table-server-pagination'
import { Button } from '@/components/ui/button'
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '@/components/ui/table'
import { ProfileStatus, } from '@prisma/client'
import UserTableFilter from './user-table-filter'
import UserTableOperation from './user-table-operation'

const UsersTable = ({ users, filter }: {
    users: Awaited<ReturnType<typeof caller['user']['getAllUsers']>>
    filter: {
        status?: string
        first_name?: string;
        last_name?: string;
        email?: string;
    }
}) => {

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
            <UserTableFilter filter={filter} />
            <Table >
                <TableHeader>
                    <TableRow>
                        <TableHead className='min-w-52'>Name</TableHead>
                        <TableHead className='min-w-32'>Status</TableHead>
                        <TableHead className='min-w-52'>Email</TableHead>
                        <TableHead className='min-w-36'>Phone #</TableHead>
                        <TableHead className='min-w-44'>Created At</TableHead>
                        <TableHead className='min-w-32'>Operation</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.data.length > 0 ? users.data.map(user => (
                        <TableRow key={user.user_id}>
                            <TableCell className='min-w-52'>
                                {user.first_name} {user.last_name}
                            </TableCell>
                            <TableCell className='min-w-32'>
                                {returnUserStats(user.status)}
                            </TableCell>
                            <TableCell className='min-w-52'>
                                {user.email}
                            </TableCell>
                            <TableCell className='min-w-36'>
                                {user.mobile}
                            </TableCell>
                            <TableCell className='min-w-44'>
                                {new Date(user.created_at).toDateString()}
                            </TableCell>
                            <TableCell className='min-w-32'>
                                <UserTableOperation user={user} />
                            </TableCell>
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