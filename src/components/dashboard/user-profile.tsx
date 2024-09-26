'use client'
import React, { useEffect, useState } from 'react'
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog'
import { CircleCheck, CircleCheckBig, CircleOff, CircleUserRound, Clock, LoaderCircle, UploadCloud } from 'lucide-react'
import { Button } from '../ui/button'
import { trpc } from '@/app/_trpc/client'
import { toast } from 'sonner'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import useGlobalStore from '@/state/globalStore'
import { UploadButton } from '@/lib/utils'
import { Separator } from '../ui/separator'

const UserProfile = () => {

    const [open, setOpen] = useState(false)

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: "",
        email: "",
        mobile: "",
        age: "",
        id_image: [''],
        birth_date: "",
    })

    const { copyText } = useGlobalStore()

    const { data, refetch } = trpc.user.getCurrentUserInfo.useQuery(undefined, {
        retry: false
    })

    const { mutateAsync, isPending } = trpc.user.updateUserInfo.useMutation({
        onSuccess: () => {
            refetch()
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

            const { first_name, last_name, email, mobile, birth_date, id_image } = formData

            if (!first_name || first_name.length < 2) return toast.error("First name is invalid")
            if (!last_name || last_name.length < 2) return toast.error("Last name is invalid")
            if (!email || email.length < 2) return toast.error("Email is invalid")
            if (!mobile || mobile.length < 11) return toast.error("Phone number is invalid")
            if (!birth_date || birth_date.length < 2) return toast.error("Birthdate is invalid")
            if (id_image.length < 2) return toast.error("Upload valid ID front & back")

            await mutateAsync({ ...formData, birth_date: new Date(birth_date).toISOString() })

        } catch (error) {
            console.log(error);
            toast.error("Something went wrong")
        }
    }

    useEffect(() => {
        if (data) setFormData({ ...data, birth_date: new Date(data.birth_date).toISOString().split("T")[0] })
    }, [data])

    const returnStatus = () => {
        if (data?.status) {
            switch (data.status) {
                case "INVALID":
                    return (
                        <Button variant={'destructive'} className='flex items-center text-base gap-2'>
                            <CircleOff size={18} />
                            Invalid
                        </Button>
                    )
                case "PENDING":
                    return (
                        <Button variant={'secondary'} className='flex items-center text-base gap-2'>
                            <Clock size={18} />
                            Pending Verification
                        </Button>
                    )
                case "VERIFIED":
                    return (
                        <Button className='flex items-center text-base gap-2'>
                            <CircleCheckBig size={18} />
                            Verified
                        </Button>
                    )
                default:
                    return null
            }
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant={'ghost'} className='px-2.5'>
                    <CircleUserRound size={25} />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className='flex items-center w-full justify-between'>
                        <h1>Profile Info</h1>
                        {data?.first_name && returnStatus()}
                    </AlertDialogTitle>
                </AlertDialogHeader>
                <form onSubmit={updateOrCreateUserInfo} className='flex flex-col gap-5 max-h-[500px] overflow-y-auto p-5'>
                    <div className='flex flex-col w-full gap-1.5'>
                        <Label>Wallet Address</Label>
                        <Input readOnly required value={data?.wallet} onClick={() => copyText(data?.wallet || "")} />
                    </div>
                    <div className='flex items-center gap-5'>
                        <div className='flex flex-col w-full gap-1.5'>
                            <Label htmlFor='first_name'>First Name</Label>
                            <Input readOnly={data?.first_name ? true : false} required placeholder='First name' value={formData.first_name} name='first_name' onChange={handleChange} />
                        </div>
                        <div className='flex flex-col w-full gap-1.5'>
                            <Label htmlFor='last_name'>Last Name</Label>
                            <Input readOnly={data?.first_name ? true : false} required placeholder='Last name' value={formData.last_name} name='last_name' onChange={handleChange} />
                        </div>
                    </div>
                    <div className='flex flex-col w-full gap-1.5'>
                        <Label htmlFor='email'>Email</Label>
                        <Input readOnly={data?.first_name ? true : false} required type='email' placeholder='Email address' value={formData.email} name='email' onChange={handleChange} />
                    </div>
                    <div className='flex flex-col w-full gap-1.5'>
                        <Label htmlFor='mobile'>Phone Number</Label>
                        <Input readOnly={data?.first_name ? true : false} required type='number' placeholder='Phone Number' value={formData.mobile} name='mobile' onChange={handleChange} />
                    </div>
                    <div className='flex items-center gap-5'>
                        <div className='flex flex-col w-full gap-1.5'>
                            <Label htmlFor='age'>Age</Label>
                            <Input readOnly={data?.first_name ? true : false} required placeholder='Age' type='number' value={formData.age} name='age' onChange={handleChange} />
                        </div>
                        <div className='flex flex-col w-full gap-1.5'>
                            <Label htmlFor='birth_date'>Birth  Date</Label>
                            <Input readOnly={data?.first_name ? true : false} required type='date' value={formData.birth_date} name='birth_date' onChange={handleChange} />
                        </div>
                    </div>
                    {data?.id_image.length === 1 &&
                        <div className='flex flex-col w-full gap-1.5'>
                            <Separator />
                            <div className='w-full flex items-center justify-between gap-5 py-5'>
                                <Label htmlFor='id_image'>Upload Valid ID (front & back)</Label>
                                <UploadButton
                                    endpoint='profileIdUploader'
                                    onClientUploadComplete={(res) => {
                                        if (res) {
                                            toast.success("Upload Completed")
                                            setFormData(prev => ({ ...prev, id_image: res.map(res => res.url) }))
                                        }
                                    }}
                                    content={{
                                        button({ ready }) {
                                            if (ready) return <div className='w-32 bg-secondary h-full flex items-center gap-2 justify-center'><UploadCloud size={18} />Upload</div>

                                            return <Button variant={'secondary'} type='button'><LoaderCircle size={18} className='animate-spin' /></Button>
                                        }
                                    }}
                                    onUploadError={(error: Error) => {
                                        // Do something with the error.
                                        toast.error(`Please upload only 2 images: one for the front of the ID and one for the back.`);
                                    }}
                                    appearance={{
                                        button: 'bg-muted text-foreground w-auto',
                                        allowedContent: 'hidden',

                                    }}
                                />
                                {formData.id_image.length > 1 && <CircleCheck size={25} className='text-primary' />}
                            </div>
                            <Separator />
                        </div>
                    }
                    <AlertDialogFooter className='flex flex-row items-center gap-10'>
                        <Button type='button' variant={'secondary'} className='w-full' onClick={() => setOpen(false)}>Close</Button>
                        {!data?.first_name && <Button className='w-full'>{isPending ? <LoaderCircle size={16} className='animate-spin' /> : "Update"}</Button>}
                    </AlertDialogFooter>
                </form >
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default UserProfile