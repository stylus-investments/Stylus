'use client'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import React from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'
import { Button } from '../ui/button'
import { LogOut, Menu } from 'lucide-react'
import Link from 'next/link'
import { ToggleTheme } from '../ui/toggle-theme'

const AdminHeader = () => {

    const session = useSession({
        required: true,
        onUnauthenticated: () => {
            redirect('/')
        }
    })

    const largeScreen = (
        <div className='items-center gap-8 text-muted-foreground text-sm hidden lg:flex'>
            <Link className='hover:text-foreground' href={'/admin/order'}>Orders</Link>
            <Link className='hover:text-foreground' href={'/admin/users'}>Users</Link>
            <Link className='hover:text-foreground' href={'/admin/'}>Admin</Link>
            <div className='ml-3 flex items-center gap-4'>
                <ToggleTheme />
                <Button>
                    <LogOut size={16} className='hover:text-foreground' />
                </Button>
            </div>
        </div>
    )

    const smallScreen = (
        <Sheet>
            <SheetTrigger asChild>
                <Button><Menu size={16} /></Button>
            </SheetTrigger>
            <SheetContent className='flex flex-col gap-5'>
                <SheetHeader>
                    <SheetTitle className='text-left border-b pb-2'>STYLUS</SheetTitle>
                </SheetHeader>
                <div className='flex flex-col gap-2 text-muted-foreground'>
                    <Link href={'/admin/order'}>Orders</Link>
                    <Link href={'/admin/users'}>Users</Link>
                    <Link href={'/admin/'}>Admin</Link>
                </div>
            </SheetContent>
        </Sheet>
    )
    return (
        <div className='fixed top-0 left-0 w-full padding h-16 border-b flex items-center justify-between'>
            <h1 className='font-[1000] text-2xl'>STYLUS</h1>
            {largeScreen}
            <div className='flex items-center gap-4 lg:hidden'>
                <ToggleTheme />
                {smallScreen}
            </div>
        </div>
    )
}

export default AdminHeader