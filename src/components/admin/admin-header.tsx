'use client'
import { signOut, useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import React from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'
import { Button } from '../ui/button'
import { LogOut, Menu } from 'lucide-react'
import Link from 'next/link'
import { ToggleTheme } from '../ui/toggle-theme'

const pages = ['Order', 'Package', 'Referral', 'Snapshot', 'Cashout', 'User', 'Admin']

const AdminHeader = ({ currentPage }: {
    currentPage: string
}) => {

    const session = useSession({
        required: true,
        onUnauthenticated: () => {
            redirect('/auth')
        }
    })

    const largeScreen = (
        <div className='items-center gap-8 text-muted-foreground text-sm hidden lg:flex'>
            {pages.map(link => (
                <Link className={`hover:text-foreground ${currentPage === link.toLocaleLowerCase() && "text-foreground font-bold underline"}`} href={`/admin/${link.toLocaleLowerCase() !== 'admin' ? link.toLocaleLowerCase() : ""}`} key={link}>{link}</Link>
            ))}
            <div className='ml-3 flex items-center gap-4'>
                <ToggleTheme />
                <Button onClick={() => signOut({ redirect: false })}>
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
                    {pages.map(link => (
                        <Link className={`hover:text-foreground ${currentPage === link.toLocaleLowerCase() && "text-foreground font-bold underline"}`} href={`/admin/${link.toLocaleLowerCase() !== 'admin' ? link.toLocaleLowerCase() : ""}`} key={link}>{link}</Link>
                    ))}
                    <Button onClick={() => signOut({ redirect: false })} className='mt-5'>
                        <LogOut size={16} className='hover:text-foreground' />
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
    return (
        <div className='fixed top-0 left-0 w-full padding h-16 border-b flex items-center justify-between backdrop-blur z-20'>
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