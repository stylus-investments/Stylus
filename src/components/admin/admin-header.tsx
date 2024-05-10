'use client'
import React from 'react'
import { ToggleTheme } from '../ui/toggle-theme'
import { Button } from '../ui/button'
import { signIn, signOut, useSession } from 'next-auth/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightToBracket } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'

const AdminHeader = () => {

    const session = useSession({
        required: true,
        onUnauthenticated: () => {
            signIn()
        }
    })

    return (
        <div className='flex sticky top-0 left-0 w-screen z-20 h-16 backdrop-blur container items-center justify-between border-b'>
            <div className='flex items-center'>
                <h1 className='text-2xl font-black text-primary'>GrowPoint</h1>
            </div>
            <div className='flex items-center gap-10 text-muted-foreground'>
                <Link className='hover:text-foreground' href={'/admin/users'} >Users</Link>
                <Link className='hover:text-foreground' href={'/admin/snapshots'} >Snapshots</Link>
            </div>
            <div className='flex items-center gap-5'>
                <ToggleTheme />
                <Button onClick={() => signOut({
                    redirect: false
                })} variant={'ghost'} title='Logout'>
                    <FontAwesomeIcon icon={faRightToBracket} width={18} height={18} className='cursor-pointer' />
                </Button>
            </div>
        </div>)
}

export default AdminHeader