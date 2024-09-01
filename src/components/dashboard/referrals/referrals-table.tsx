'use client'
import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import usePaginationStore from '@/state/paginationStore';
import { Card, CardContent } from '@/components/ui/card';
import TablePagination from '../table-pagination';
import { trpc } from '@/app/_trpc/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ReferralsTable = () => {

    const { data, isLoading } = trpc.referral.getReferals.useQuery(undefined, {
        refetchOnMount: false
    })

    const [currentTable, setCurrentTable] = useState<{
        first_name: string
        last_name: string
        created_at: Date
        totalPlans: number
        reward: number
        unpaidPlans: number
    }[] | undefined>(undefined)

    const { getCurrentData, currentPage } = usePaginationStore()

    useEffect(() => {

        setCurrentTable(getCurrentData(data))

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, currentPage])

    return (
        <>
            {isLoading ? <ReferalTableSkeleton /> :
                <Card>
                    <CardContent className='flex flex-col gap-2'>
                        <Table>
                            <TableHeader>
                                <TableRow className='text-xs sm:text-sm'>
                                    <TableHead className='min-w-40'>Name</TableHead>
                                    <TableHead className='min-w-28'>Total Plans</TableHead>
                                    <TableHead className='min-w-28'>Unpaid Plans</TableHead>
                                    <TableHead className='min-w-28'>Reward</TableHead>
                                    <TableHead className='min-w-32'>Operation</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentTable && currentTable.length > 0 ?
                                    currentTable.map((user, i) => (
                                        <TableRow key={i} className='text-muted-foreground hover:text-foreground text-xs md:text-sm'>
                                            <TableCell>{user.first_name} {user.last_name}</TableCell>
                                            <TableCell>{user.totalPlans}</TableCell>
                                            <TableCell>{user.unpaidPlans}</TableCell>
                                            <TableCell>₱{user.reward}</TableCell>
                                            <TableCell>
                                                <Button className='h-7' onClick={() => toast.error("Poke me daddy!")}>Poke!</Button>
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
                        <div className='w-full text-center text-xs sm:text-sm text-muted-foreground'>Referral Rewards</div>
                        <TablePagination data={data || []} />
                    </CardContent>
                </Card>
            }
        </>
    )
}

const ReferalTableSkeleton = () => {

    return (
        <Card>
            <CardContent className='flex flex-col gap-2'>
                <Table>
                    <TableHeader>
                        <TableRow className='text-xs sm:text-sm'>
                            <TableHead className='min-w-40'>Name</TableHead>
                            <TableHead className='min-w-28'>Total Plans</TableHead>
                            <TableHead className='min-w-28'>Unpaid Plans</TableHead>
                            <TableHead className='min-w-28'>Reward</TableHead>
                            <TableHead className='min-w-28'>Claimed</TableHead>
                            <TableHead className='min-w-32 text-right'>Operation</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[1, 2, 3, 4, 5, 6, 7].map(skel => (
                            <TableRow key={skel} className='text-muted-foreground hover:text-foreground text-xs md:text-sm'>
                                <TableCell>
                                    <Skeleton className='w-32 h-7' />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className='w-24 h-7' />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className='w-24 h-7' />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className='w-24 h-7' />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className='w-24 h-7' />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className='w-40 h-7' />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className='w-full text-center text-xs sm:text-sm text-muted-foreground'>Referral Rewards</div>
                <TablePagination data={[]} />
            </CardContent>
        </Card>
    )
}

export default ReferralsTable