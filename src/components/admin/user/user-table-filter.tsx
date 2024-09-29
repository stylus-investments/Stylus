'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProfileStatus } from '@prisma/client'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const UserTableFilter = ({ filter }: {
    filter: {
        status?: string
        first_name?: string;
        last_name?: string;
        email?: string;
    }
}) => {

    const [searchQuery, setSearchQuery] = useState({
        first_name: '',
        last_name: '',
        email: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }
    const searchUser = () => {
        const { first_name, last_name, email } = searchQuery
        const url = new URL(window.location.href)
        url.searchParams.set('first_name', first_name)
        url.searchParams.set('last_name', last_name)
        url.searchParams.set('email', email)
        url.searchParams.set('page', '1'); // Reset to the first page on status change
        router.push(url.toString()); // Navigate to the updated URL
    }

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
                        <SelectItem value='all'>All Users</SelectItem>
                        <SelectItem value={ProfileStatus['PENDING']}>Pending</SelectItem>
                        <SelectItem value={ProfileStatus['VERIFIED']}>Verified</SelectItem>
                        <SelectItem value={ProfileStatus['INVALID']}>Invalid</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className='flex flex-col gap-2'>
                <Label>Name</Label>
                <div className='flex items-center gap-1'>
                    <Input value={searchQuery.first_name} onChange={handleChange} name='first_name' className='w-28' placeholder='First' />
                    <Input value={searchQuery.last_name} onChange={handleChange} name='last_name' className='w-28' placeholder='Last' />
                </div>
            </div>
            <div className='flex flex-col gap-2'>
                <Label>Email</Label>
                <Input value={searchQuery.email} onChange={handleChange} name='email' className='w-40' placeholder='Email' />
            </div>
            <Button className='mt-auto' onClick={searchUser}>
                <Search size={18} />
            </Button>
        </div>
    )
}

export default UserTableFilter