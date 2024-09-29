'use client'
import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import usePaginationStore from '@/state/paginationStore';
import { Card, CardContent } from '@/components/ui/card';
import TablePagination from '../table-pagination';
import { trpc } from '@/app/_trpc/client';
import { Skeleton } from '@/components/ui/skeleton';

const TopReferralsTable = () => {

    const { data, isLoading } = trpc.referral.getReferralLeaderboard.useQuery(undefined, {
        refetchOnMount: false
    })

    const [currentTable, setCurrentTable] = useState<{
        user_info: {
            first_name: string;
            last_name: string;
        };
        total_reward: number;
        total_invites: number;
    }[] | undefined>(undefined)

    const { getCurrentData, currentPage } = usePaginationStore()

    useEffect(() => {

        setCurrentTable(getCurrentData(data))

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, currentPage])

    return (
        <>
            {isLoading ? <TopReferralsTablekeleton /> :
                <Card>
                    <CardContent className='flex flex-col gap-2'>
                        <Table>
                            <TableHeader>
                                <TableRow className='text-xs sm:text-sm'>
                                    <TableHead className='min-w-52'>Full Name</TableHead>
                                    <TableHead className='min-w-32'>Total Invites</TableHead>
                                    <TableHead className='min-w-32'>Total Reward</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentTable && currentTable.length > 0 ?
                                    currentTable.map((user, i) => (
                                        <TableRow key={i} className='text-muted-foreground hover:text-foreground text-xs md:text-sm'>
                                            <TableCell>{user.user_info.first_name} {user.user_info.last_name}</TableCell>
                                            <TableCell>{user.total_invites}</TableCell>
                                            <TableCell>{user.total_reward}</TableCell>
                                        </TableRow>
                                    ))
                                    :
                                    <TableRow>
                                        <TableCell>No Data</TableCell>
                                    </TableRow>
                                }
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            }
        </>
    )
}

const TopReferralsTablekeleton = () => {

    return (
        <Card>
            <CardContent className='flex flex-col gap-2'>
                <Table>
                    <TableHeader>
                        <TableRow className='text-xs sm:text-sm'>
                            <TableHead className='min-w-52'>Name</TableHead>
                            <TableHead className='min-w-32'>Total Invites</TableHead>
                            <TableHead className='min-w-32'>Total Reward</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[1, 2, 3, 4, 5, 6, 7].map(skel => (
                            <TableRow key={skel} className='text-muted-foreground hover:text-foreground text-xs md:text-sm'>
                                <TableCell>
                                    <Skeleton className='w-52 h-7' />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className='w-32 h-7' />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className='w-32 h-7' />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default TopReferralsTable