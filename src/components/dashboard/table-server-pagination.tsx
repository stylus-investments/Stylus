'use client'
import React, { useState } from 'react'
import { Input } from '../ui/input'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { Search } from 'lucide-react'

const TableServerPagination = ({ pagination }: {
    pagination: {
        totalPages: number
        page: string
        hasNextPage: boolean
        hasPreviousPage: boolean
        total: number
    }
}) => {

    const [gotoInput, setGotoInput] = useState('')

    const { page, totalPages, total, hasNextPage, hasPreviousPage } = pagination

    const router = useRouter()

    const handlePageChange = (newPage: string) => {
        const url = new URL(window.location.href);
        url.searchParams.set('page', newPage); // Set the new page value
        router.push(url.toString()); // Navigate to the updated URL
    };

    return (
        <footer className={`flex mt-auto min-h-[80px] flex-col pt-5 gap-5 sm:flex-row justify-between border-t text-xs lg:text-md text-muted-foreground`}>
            <div className='flex items-center gap-3 w-full'>
                <div className='font-medium md:text-base'>
                    Page {page} of {totalPages}
                </div>
                <div className='relative w-44'>
                    <Input
                        type='number'
                        className='outline-none border px-3 py-1 w-full'
                        placeholder='Go to'
                        value={gotoInput}
                        onChange={(e) => {
                            const value = parseInt(e.target.value);
                            setGotoInput(e.target.value)
                        }}
                    />
                    <Button className='absolute right-0 top-0 border' onClick={() => {
                        if (gotoInput) {
                            handlePageChange(Number(gotoInput) > totalPages ? '1' : gotoInput)
                            setGotoInput('')
                        }
                    }}>
                        <Search size={18} />
                    </Button>
                </div>
            </div>

            <div className='flex items-center gap-5 w-full'>
                <div className='flex items-center mr-auto'>
                    <div className='font-medium md:text-base'>Total: <span className='font-black'>{total}</span></div>
                </div>

                <div className='flex items-center gap-5 h-full'>
                    <Button onClick={() => handlePageChange((Number(page) - 1).toString())}
                        className={`w-20 lg:w-32 border h-8`}
                        disabled={!hasPreviousPage}>
                        Prev
                    </Button>
                    <Button onClick={() => handlePageChange((Number(page) + 1).toString())}
                        className={`w-20 lg:w-32 border h-8 `}
                        disabled={!hasNextPage}>
                        Next
                    </Button>
                </div>
            </div>
        </footer>
    )
}

export default TableServerPagination