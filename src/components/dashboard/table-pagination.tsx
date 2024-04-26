'use client'
import usePaginationStore from '@/state/paginationStore'
import React from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

const TablePagination = ({ data }: { data: any[] }) => {

    const { currentPage, getTotalPages, setCurrentPage, goToPreviousPage, goToNextPage } = usePaginationStore()

    return (
        <footer className={`flex mt-auto min-h-[80px] items-center justify-between border-t text-xs lg:text-md text-muted-foreground`}>
            <div className='sm:flex items-center gap-3 w-44 lg:w-56 hidden'>
                <div className='font-medium md:text-base'>
                    Page {currentPage} of {getTotalPages(data)}
                </div>
                <Input
                    type='text'
                    className='outline-none border px-3 py-1 w-1/3 lg:w-1/2'
                    placeholder='Go to'
                    onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setCurrentPage(isNaN(value) ? 1 : value);
                    }}
                />
            </div>

            <div className='flex items-center mr-auto'>
                <div className='font-medium md:text-base'>Total: <span className='font-black'>{data && data.length}</span></div>
            </div>

            <div className='flex items-center gap-5 h-full'>
                <Button onClick={goToPreviousPage}
                    className={`w-20 lg:w-32 border h-8`}
                    disabled={currentPage === 1}>
                    Prev
                </Button>
                <Button onClick={() => goToNextPage(data)}
                    className={`w-20 lg:w-32 border h-8 `}
                    disabled={currentPage === getTotalPages(data)}>
                    Next
                </Button>
            </div>

        </footer>
    )
}

export default TablePagination