'use client'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cashout_status } from '@prisma/client'
import { useRouter } from 'next/navigation'

const FilterCashoutTable = ({ filter }: {
    filter: {
        status: cashout_status | undefined
    }
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
    }
    return (
        <div className="flex items-center gap-5 justify-between">
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
                        <SelectItem value={cashout_status.PENDING}>Pending</SelectItem>
                        <SelectItem value={cashout_status.COMPLETED}>Completed</SelectItem>
                        <SelectItem value={cashout_status.FAILED}>Invalid</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}

export default FilterCashoutTable