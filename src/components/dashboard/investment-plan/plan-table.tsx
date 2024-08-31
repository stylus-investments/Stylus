'use client'
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import usePaginationStore from '@/state/paginationStore';
import React, { useEffect, useState } from 'react'
import TablePagination from '../table-pagination';
import { trpc } from '@/app/_trpc/client';
import { user_investment_plan } from '@prisma/client';
import { caller } from '@/app/_trpc/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const UserPlansTable = ({ initialData }: {
    initialData: Awaited<ReturnType<typeof caller['investment']['getUserInvestmentPlans']>>
}) => {

    const { data } = trpc.investment.getUserInvestmentPlans.useQuery(undefined, {
        refetchOnMount: false,
        initialData: initialData
    })

    const [currentTable, setCurrentTable] = useState<user_investment_plan[] | undefined>(undefined)

    const { getCurrentData, currentPage } = usePaginationStore()

    useEffect(() => {

        setCurrentTable(getCurrentData(data))

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, currentPage])

    return (
        <div className='pt-28 padding flex flex-col gap-10'>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <Link href={'/dashboard/wallet/'}>
                            Wallet
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Plans</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <Card>
                <CardContent className='flex flex-col gap-5'>
                    <Table>
                        <TableHeader>
                            <TableRow className='text-xs md:text-sm'>
                                <TableHead className='min-w-32'>Plan Name</TableHead>
                                <TableHead className='min-w-32'>Monthly Payment</TableHead>
                                <TableHead className=' min-w-52'>Profit Protection</TableHead>
                                <TableHead className='min-w-32'>Health Insurance</TableHead>
                                <TableHead className='min-w-32'>Completed</TableHead>
                                <TableHead className='min-w-32'>Payments</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentTable && currentTable.length > 0 ? currentTable.map((plan, i) => (
                                <TableRow key={plan.id} className='text-muted-foreground hover:text-foreground text-xs md:text-sm'>
                                    <TableCell>{plan.name}</TableCell>
                                    <TableCell>₱{plan.total_price}</TableCell>
                                    <TableCell>{plan.profit_protection ? "Yes" : "No"}</TableCell>
                                    <TableCell>{plan.insurance ? "Yes" : "No"}</TableCell>
                                    <TableCell>{plan.completed ? "Yes" : "No"}</TableCell>
                                    <TableCell>
                                        <Link href={`/dashboard/wallet/plans/${plan.id}`}>
                                            <Button className='h-7'>Pay</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            )) :
                                <TableRow>
                                    <TableCell>No Data</TableCell>
                                </TableRow>
                            }
                        </TableBody>
                    </Table>
                    <div className='w-full text-center text-xs sm:text-sm text-muted-foreground'>Plan List</div>
                    <TablePagination data={data || []} />
                </CardContent>
            </Card >
        </div>
    )
}



export default UserPlansTable