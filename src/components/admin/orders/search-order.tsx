import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ORDERSTATUS, PAYMENT_METHOD } from '@/constant/order'
import React from 'react'

const SearchOrder = ({ searchQuery, setSearchQuery }: {
    searchQuery: {
        transaction_id: string;
        wallet_address: string;
        method: string
        status: string;
    }
    setSearchQuery: React.Dispatch<React.SetStateAction<{
        transaction_id: string;
        wallet_address: string;
        status: string;
        method: string
    }>>
}) => {

    return (
        <div className='flex items-center gap-5 w-full md:w-1/2'>
            <Input placeholder='Transaction ID'
                value={searchQuery.transaction_id}
                onChange={(e) => setSearchQuery(prev => ({ ...prev, transaction_id: e.target.value }))}
            />
            <Input placeholder='Wallet Address'
                value={searchQuery.wallet_address}
                onChange={(e) => setSearchQuery(prev => ({ ...prev, wallet_address: e.target.value }))}
            />
            <Select value={searchQuery.method} onValueChange={(value) => setSearchQuery(prev => ({ ...prev, method: value === 'all' ? '' : value }))}>
                <SelectTrigger>
                    <SelectValue placeholder="Payment Method" />
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Payment Method</SelectLabel>
                            <SelectItem className='uppercase' value={'all'}>All Payment Method</SelectItem>
                            {Object.keys(PAYMENT_METHOD).map((method, i) => (
                                <SelectItem key={i} className='uppercase' value={method}>{method}</SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </SelectTrigger>
            </Select>
            <Select value={searchQuery.status} onValueChange={(value) => setSearchQuery(prev => ({ ...prev, status: value === 'all' ? '' : value }))}>
                <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Order Status</SelectLabel>
                            <SelectItem className='uppercase' value={'all'}>All Orders</SelectItem>
                            {Object.keys(ORDERSTATUS).map((status, i) => (
                                <SelectItem key={i} className='uppercase' value={status}>{status}</SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </SelectTrigger>
            </Select>
        </div>
    )
}

export default SearchOrder