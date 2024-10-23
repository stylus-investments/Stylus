'use client'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import React from 'react'
import { useRouter } from 'next/navigation'
import { ORDERSTATUS } from '@/constant/order'
import { trpc } from '@/app/_trpc/client'
import { Skeleton } from '@/components/ui/skeleton'

const FilterOrderHistory = ({ filter, planID }: {
    filter: {
        status: string | undefined;
        request_chat: string;
    },
    planID: string
}) => {

    const { data } = trpc.investment.retrieveSinglePlan.useQuery({
        plan_id: planID
    }, {
        enabled: false
    })

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
    }

    return (
        <div className='flex gap-5 w-full items-start md:justify-between md:items-center md:flex-row flex-col'>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <Link href={'/dashboard/wallet/'}>
                            Wallet
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <Link href={'/dashboard/wallet/plans'}>
                            Investment Plans
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{data?.data.name || <Skeleton className='h-6 w-28' />}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-5 justify-end">
                <div className='flex flex-col gap-2'>
                    <Label>Status</Label>
                    <Select value={filter.status || 'all'} onValueChange={(val) => {
                        if (val === 'all') {
                            handleStatusChange('')
                        } else {
                            handleStatusChange(val)
                        }
                    }}>
                        <SelectTrigger className='w-32'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>All Status</SelectItem>
                            <SelectItem value={ORDERSTATUS['processing']}>Processing</SelectItem>
                            <SelectItem value={ORDERSTATUS['paid']}>Paid</SelectItem>
                            <SelectItem value={ORDERSTATUS['unpaid']}>Unpaid</SelectItem>
                            <SelectItem value={ORDERSTATUS['upcoming']}>Upcoming</SelectItem>
                            <SelectItem value={ORDERSTATUS['invalid']}>Invalid</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
}

export default FilterOrderHistory