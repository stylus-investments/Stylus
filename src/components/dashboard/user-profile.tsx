'use client'
import React, { useEffect, useState } from 'react'
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog'
import { CircleUserRound, CircleX, Copy, LoaderCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { trpc } from '@/app/_trpc/client'
import { toast } from 'sonner'
import { Label } from '../ui/label'
import { Input } from '../ui/input'

const UserProfile = () => {

    const [open, setOpen] = useState(false)

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: "",
        email: "",
        mobile: "",
        age: "",
        birth_date: "",
    })

    const { data } = trpc.user.getCurrentUserInfo.useQuery(undefined, {
        retry: false
    })

    const { mutateAsync, isPending } = trpc.user.updateUserInfo.useMutation({
        onSuccess: () => {
            toast.success("Success! info updated")
        }
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const updateOrCreateUserInfo = async (e: React.FormEvent) => {
        try {

            e.preventDefault()

            const { first_name, last_name, email, mobile, birth_date } = formData

            if (!first_name || first_name.length < 2) return toast.error("First name is invalid")
            if (!last_name || last_name.length < 2) return toast.error("Last name is invalid")
            if (!email || email.length < 2) return toast.error("Email is invalid")
            if (!mobile || mobile.length < 2) return toast.error("Mobile is invalid")
            if (!birth_date || birth_date.length < 2) return toast.error("Birthdate is invalid")

            await mutateAsync({ ...formData, birth_date: new Date(birth_date).toISOString() })

        } catch (error) {
            console.log(error);
            toast.error("Something went wrong")
        }
    }

    useEffect(() => {
        if (data) setFormData({ ...data, birth_date: new Date(data.birth_date).toISOString().split("T")[0] })
    }, [data])

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant={'ghost'} className='px-2.5'>
                    <CircleUserRound size={25} />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Profile Information</AlertDialogTitle>
                </AlertDialogHeader>
                <form onSubmit={updateOrCreateUserInfo} className='flex flex-col gap-5'>
                    <div className='flex items-center gap-5'>
                        <div className='flex flex-col w-full gap-1.5'>
                            <Label htmlFor='first_name'>First Name</Label>
                            <Input required placeholder='First name' value={formData.first_name} name='first_name' onChange={handleChange} />
                        </div>
                        <div className='flex flex-col w-full gap-1.5'>
                            <Label htmlFor='last_name'>Last Name</Label>
                            <Input required placeholder='Last name' value={formData.last_name} name='last_name' onChange={handleChange} />
                        </div>
                    </div>
                    <div className='flex flex-col w-full gap-1.5'>
                        <Label htmlFor='email'>Email</Label>
                        <Input required type='email' placeholder='Email address' value={formData.email} name='email' onChange={handleChange} />
                    </div>
                    <div className='flex flex-col w-full gap-1.5'>
                        <Label htmlFor='mobile'>Phone Number</Label>
                        <Input required type='number' placeholder='Email address' value={formData.mobile} name='mobile' onChange={handleChange} />
                    </div>
                    <div className='flex items-center gap-5'>
                        <div className='flex flex-col w-full gap-1.5'>
                            <Label htmlFor='age'>Age</Label>
                            <Input required placeholder='Age' type='number' value={formData.age} name='age' onChange={handleChange} />
                        </div>
                        <div className='flex flex-col w-full gap-1.5'>
                            <Label htmlFor='birth_date'>Birth  Date</Label>
                            <Input required type='date' value={formData.birth_date} name='birth_date' onChange={handleChange} />
                        </div>
                    </div>
                    <AlertDialogFooter className='flex flex-row items-center gap-10'>
                        <Button type='button' variant={'secondary'} className='w-full' onClick={() => setOpen(false)}>Close</Button>
                        <Button className='w-full'>{isPending ? <LoaderCircle size={16} className='animate-spin' /> : "Update"}</Button>
                    </AlertDialogFooter>
                </form >
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default UserProfile