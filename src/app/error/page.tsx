'use client'
import { Button } from '@/components/ui/button'
import { signIn } from 'next-auth/react'
import React from 'react'

const AdminErrorPage = () => {
    return (
        <div className='grid place-content-center w-screen h-screen'>
            <div className='border p-10 flex flex-col items-center gap-10'>
                <h1>Something Went Wrong</h1>
                <Button onClick={() => signIn()} variant={'link'}>Sign In</Button>
            </div>
        </div>
    )
}

export default AdminErrorPage