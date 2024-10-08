'use client'
import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import usePaginationStore from '@/state/paginationStore';
import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/app/_trpc/client';
import { Skeleton } from '@/components/ui/skeleton';
import TableServerPagination from '../table-server-pagination';
import { Medal } from 'lucide-react';
import { Label } from '@/components/ui/label';

const TopReferralsTable = ({ page }: { page: string | undefined }) => {

    const { data, isLoading } = trpc.referral.getReferralLeaderboard.useQuery({ page }, {
        refetchOnMount: false
    })

    const returnFullName = (firstName: string, lastName: string) => {

        const obscure = (name: string) => {
            return name.charAt(0) + name.charAt(1) + '*'.repeat(name.length - 1);
        };

        return `${obscure(firstName)} ${obscure(lastName)}`
    }

    const returnRankColor = (rank: number) => {
        switch (rank) {
            case 1:
                return (
                    <div className='flex items-center justify-between px-2 bg-primary w-12 py-1.5 rounded-lg'>
                        <Medal size={18} className='text-white' />
                        <Label className='font-[1000] text-white'>{rank}</Label>
                    </div>
                );
            case 2:
                return (
                    <div className='flex items-center justify-between px-2 bg-gray-400 border w-12 py-1.5 rounded-lg'>
                        <Medal size={18} className='text-white' />
                        <Label className='font-[1000] text-white'>{rank}</Label>
                    </div>
                );
            case 3:
                return <div className='flex items-center justify-between px-2 bg-orange-600 border w-12 py-1.5 rounded-lg'>
                    <Medal size={18} className='text-white' />
                    <Label className='font-[1000] text-white'>{rank}</Label>
                </div>
            default:
                return `#${rank}`
        }
    }

    return (
        <div className='flex flex-col'>
            {isLoading ? <TopReferralsTablekeleton /> :
                <Card>
                    <CardContent className='flex flex-col gap-2'>
                        <Table>
                            <TableHeader>
                                <TableRow className='text-xs sm:text-sm'>
                                    <TableHead className='min-w-52'>Rank</TableHead>
                                    <TableHead className='min-w-52'>Full Name</TableHead>
                                    <TableHead className='min-w-32'>Total Invites</TableHead>
                                    <TableHead className='min-w-32'>Total Reward</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.data && data.data.length > 0 ?
                                    data.data.map((user, i) => (
                                        <TableRow key={i} className={`text-muted-foreground hover:text-foreground text-xs md:text-sm`}>
                                            <TableCell>{returnRankColor(user.rank)}</TableCell>
                                            <TableCell>{returnFullName(user.user_info.first_name, user.user_info.last_name)}</TableCell>
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
            {data && <TableServerPagination pagination={data.pagination} />}
        </div>
    )
}

const TopReferralsTablekeleton = () => {

    return (
        <Card>
            <CardContent className='flex flex-col gap-2'>
                <Table>
                    <TableHeader>
                        <TableRow className='text-xs sm:text-sm'>
                            <TableHead className='min-w-52'>Rank</TableHead>
                            <TableHead className='min-w-52'>Name</TableHead>
                            <TableHead className='min-w-32'>Total Invites</TableHead>
                            <TableHead className='min-w-32'>Total Reward</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[1, 2, 3, 4, 5, 6, 7].map(skel => (
                            <TableRow key={skel} className='text-muted-foreground hover:text-foreground text-xs md:text-sm'>
                                <TableCell>
                                    <Skeleton className='w-24 h-7' />
                                </TableCell>
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