'use client'
import { trpc } from '@/app/_trpc/client'
import { caller } from '@/app/_trpc/server'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn, UploadButton } from '@/lib/utils'
import useGlobalStore from '@/state/globalStore'
import { ProfileStatus } from '@prisma/client'
import { CircleOff, Clock, CircleCheckBig, CalendarIcon, LoaderCircle, UploadCloud, CircleX } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

const ProfileForm = ({ profileInfo }: {
    profileInfo: Awaited<ReturnType<typeof caller['user']['getCurrentUserInfo']>>
}) => {

    const router = useRouter()
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: "",
        email: "",
        mobile: "",
        age: "",
        front_id: '',
        back_id: '',
        birth_date: "",
    })

    const { copyText } = useGlobalStore()

    const { mutateAsync, isPending } = trpc.user.updateUserInfo.useMutation({
        onSuccess: () => {
            router.refresh()
            toast.success("Success! profile updated. Please wait for admin to verify your account.")
        },
        onError: (err) => {
            toast.error(err.message)
        }
    })

    const updateUserID = trpc.user.updateProfileID.useMutation({
        onError: (err) => {
            toast.error(err.message)
        }
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const updateOrCreateUserInfo = async (e: React.FormEvent) => {

        e.preventDefault()

        const { first_name, last_name, email, mobile, birth_date, front_id, back_id, age } = formData

        if (!first_name || first_name.length < 2) return toast.error("First name is invalid")
        if (!last_name || last_name.length < 2) return toast.error("Last name is invalid")
        if (!email || email.length < 2) return toast.error("Email is invalid")
        if (!mobile || mobile.length < 11) return toast.error("Phone number is invalid")
        if (!age) return toast.error("Age is required")
        if (!birth_date || birth_date.length < 2) return toast.error("Birthdate is invalid")
        if (!front_id) return toast.error("Upload a valid front ID")
        if (!back_id) return toast.error("Upload a valid back ID")

        await mutateAsync({ ...formData, birth_date: new Date(birth_date).toISOString() })
    }

    useEffect(() => {
        setFormData({ ...profileInfo, front_id: profileInfo.front_id || "", back_id: profileInfo.back_id || "" })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const returnStatus = () => {
        if (profileInfo?.status) {
            switch (profileInfo.status) {
                case "INVALID":
                    return (
                        <Button type='button' variant={'destructive'} className='flex items-center text-base gap-2'>
                            <CircleOff size={18} />
                            Invalid
                        </Button>
                    )
                case "PENDING":
                    return (
                        <Button type='button' variant={'secondary'} className='flex items-center text-base gap-2'>
                            <Clock size={18} />
                            Pending Verification
                        </Button>
                    )
                case "VERIFIED":
                    return (
                        <Button type='button' className='flex items-center text-base gap-2'>
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
        <form className='padding py-28 flex flex-col gap-10' onSubmit={updateOrCreateUserInfo}>
            <div className='flex flex-col gap-1 border-b pb-3'>
                <Label className='text-2xl font-black'>Profile Info</Label>
                <div className='w-full flex flex-wrap items-center justify-between gap-y-3'>
                    <div className='text-muted-foreground'>Manage your profile information.</div>
                    {returnStatus()}
                </div>
                {profileInfo.verification_message && <div className='w-full flex items-center gap-3 bg-destructive text-white px-3 mt-2 py-2 rounded-lg'>
                    <CircleX size={30} className='w-10' />
                    <div>{profileInfo.verification_message}</div>
                </div>}
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-16 gap-8 w-full'>
                <div className='flex flex-col w-full  gap-2'>
                    <Label>Wallet Address</Label>
                    <Input readOnly className='w-full cursor-pointer' value={profileInfo.wallet} onClick={() => copyText(profileInfo.wallet)} />
                    <small className='text-muted-foreground'>Your wallet address is displayed above.</small>
                </div>
                <div className='flex flex-col w-full  gap-2'>
                    <Label>Full Name</Label>
                    <div className='w-full flex items-center gap-3'>
                        <Input required name='first_name' className='w-full cursor-pointer' value={formData.first_name} onChange={handleChange} />
                        <Input required name='last_name' className='w-full cursor-pointer' value={formData.last_name} onChange={handleChange} />
                    </div>
                    <small className='text-muted-foreground'>Enter your full name as it appears on your official documents.</small>
                </div>
                <div className='flex flex-col w-full  gap-2'>
                    <Label htmlFor='email'>Email</Label>
                    <Input required type='email' name='email' className='w-full cursor-pointer' value={formData.email} onChange={handleChange} />
                    <small className='text-muted-foreground'>This is your linked email address.</small>
                </div>
                <div className='flex flex-col w-full  gap-2'>
                    <Label htmlFor='age'>Age</Label>
                    <Input required type='number' name='age' className='w-full cursor-pointer' value={formData.age} onChange={handleChange} />
                    <small className='text-muted-foreground'>Please provide your age for verification purposes.</small>
                </div>
                <div className='flex flex-col w-full  gap-2'>
                    <Label htmlFor='mobile'>Phone Number</Label>
                    <Input required name='mobile' className='w-full cursor-pointer' value={formData.mobile} onChange={handleChange} />
                    <small className='text-muted-foreground'>This is your linked phone number for account verification.</small>
                </div>
                <div className='flex flex-col w-full  gap-2'>
                    <Label htmlFor='birth_date'>Birth Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !formData.birth_date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.birth_date ? new Date(formData.birth_date).toDateString() : <span>Select your birth date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                fromYear={1960}
                                captionLayout="dropdown-buttons"
                                toYear={2025}
                                mode="single"
                                selected={new Date(formData.birth_date)}
                                onSelect={(date) => {
                                    if (date) {
                                        setFormData(prev => ({ ...prev, birth_date: date.toISOString() }))
                                    }
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <small className='text-muted-foreground'>Your birthdate helps us verify your identity.</small>
                </div>
                <div className='flex flex-col gap-3 w-full '>
                    <div className='w-full flex items-center justify-between'>
                        <Label>Upload Valid ID (Front)</Label>
                        {(profileInfo.status === ProfileStatus['INCOMPLETE'] || profileInfo.status === ProfileStatus['INVALID']) && formData.front_id && <Button type='button' variant={'secondary'} onClick={() => setFormData(prev => ({ ...prev, front_id: "" }))}>Reupload</Button>}
                    </div>
                    <UploadButton
                        className={`w-40 ${formData.front_id && "hidden"}`}
                        endpoint='profileIdUploader'
                        onClientUploadComplete={async (res) => {
                            // Do something with the response
                            if (res) {
                                updateUserID.mutate({
                                    front_id: res[0].url
                                })
                                setFormData(prev => ({ ...prev, front_id: res[0].url }))
                                toast.success("Success! Front ID Uploaded")
                            }
                        }}
                        content={{
                            button(props) {

                                if (props.ready) return <div className='w-40 h-ful flex items-center gap-2 h-full bg-secondary justify-center'><UploadCloud size={18} />Upload</div>

                                return <Button variant={'secondary'} type='button'><LoaderCircle size={18} className='animate-spin' /></Button>
                            }
                        }}
                        onUploadError={(error: Error) => {
                            toast.error(error.message)
                        }}
                        appearance={{
                            button: 'bg-muted text-foreground w-auto',
                            allowedContent: "hidden"
                        }}
                    />
                    {formData.front_id && <Image src={formData.front_id} alt='Front ID' width={500} height={200} className='w-full flex bg-secondary h-64 object-contain' />}
                    <small className='text-muted-foreground'>Please provide the front of your ID for identity verification.</small>
                </div>
                <div className='flex flex-col gap-3 w-full '>
                    <div className='flex w-full items-center justify-between'>
                        <Label>Upload Valid ID (Back)</Label>
                        {(profileInfo.status === ProfileStatus['INCOMPLETE'] || profileInfo.status === ProfileStatus['INVALID']) && formData.back_id && <Button type='button' variant={'secondary'} onClick={() => setFormData(prev => ({ ...prev, back_id: "" }))}>Reupload</Button>}
                    </div>
                    <UploadButton
                        className={`w-40 ${formData.back_id && "hidden"}`}
                        endpoint='profileIdUploader'
                        onClientUploadComplete={async (res) => {
                            // Do something with the response
                            if (res) {
                                updateUserID.mutate({
                                    back_id: res[0].url
                                })
                                setFormData(prev => ({ ...prev, back_id: res[0].url }))
                                toast.success("Success! Back ID Uploaded")
                            }
                        }}
                        content={{
                            button(props) {

                                if (props.ready) return <div className='w-40 h-ful flex items-center gap-2 h-full bg-secondary justify-center'><UploadCloud size={18} />Upload</div>

                                return <Button variant={'secondary'} type='button'><LoaderCircle size={18} className='animate-spin' /></Button>
                            }
                        }}
                        onUploadError={(error: Error) => {
                            toast.error(error.message)
                        }}
                        appearance={{
                            button: 'bg-muted text-foreground w-auto',
                            allowedContent: "hidden"
                        }}
                    />
                    {formData.back_id && <Image src={formData.back_id} alt='Back ID' width={500} height={200} className='w-full h-64 object-contain bg-secondary' />}
                    <small className='text-muted-foreground'>Please provide the back of your ID for identity verification.</small>
                </div>
            </div>
            <div className='border-t pt-5 w-full flex justify-center'>
                {(profileInfo.status === ProfileStatus.INCOMPLETE || profileInfo.status === ProfileStatus.INVALID) && <Button disabled={isPending} className='w-full max-w-80'>{isPending ? <LoaderCircle size={16} className='animate-spin' /> : "Update"}</Button>}
            </div>
        </form>
    )
}

export default ProfileForm