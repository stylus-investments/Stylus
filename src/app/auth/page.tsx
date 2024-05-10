'use client'
import LoginForm from '@/components/auth/LoginForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import useAuthStore from '@/state/authStore'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const AdminAuthPage = () => {

    const router = useRouter()
    const session = useSession()

    const { formData, setFormData, loginAdmin } = useAuthStore()
    const [inputType, setInputType] = useState<'text' | 'password'>('text')

    useEffect(() => {
        if (session.status === 'authenticated') {
            router.push('/admin/users')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session])

    return (
        <div className='grid w-screen h-screen place-items-center px-5'>
            <Card className='w-full sm:w-96'>
                <CardHeader>
                    <CardTitle className='text-center'>Admin Panel</CardTitle>
                    <CardDescription>Enter your username and password below to sign in.</CardDescription>
                </CardHeader>
                <CardContent className='flex flex-col gap-2'>
                    <LoginForm
                        formData={formData}
                        setFormData={setFormData}
                        loginAdmin={loginAdmin}
                        inputType={inputType}
                        setInputType={setInputType}
                    />
                    <Link href={'/'}>
                        <Button variant={'link'} className='px-0'>
                            Navigate to homepage
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}

export default AdminAuthPage