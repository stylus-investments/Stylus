'use client'
import React, { useEffect, useState } from 'react'
import useProfileStore from '@/state/profileStore'
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog'
import { Button } from '../ui/button'
import { trpc } from '@/app/_trpc/client'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { user } from '@prisma/client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'sonner'

const ProfilePage = () => {

    const { open, setOpen } = useProfileStore()

    const profileData = trpc.profile.get.useQuery()
    const updateProfile = trpc.profile.update.useMutation()
    const [userProfile, setUserProfile] = useState<user | null>(null)

    useEffect(() => {

        if (profileData.data) {
            setUserProfile(profileData.data as any)
        }

    }, [profileData.data])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setUserProfile(prev => ({ ...prev!, [name]: value }))
    }

    const submitUpdateProfile = async (e: React.FormEvent) => {
        try {
            e.preventDefault()

            const { email, phishing_code } = userProfile!

            if (!email) return toast.error("Email is required")
            if (!phishing_code) return toast.error("Phishing code is required")

            const result = await updateProfile.mutateAsync({ email, phishing_code })
            if (result) {
                toast.success("Success profile info updated.")
            }

        } catch (error) {
            console.log(error);
            alert("Something went wrong")
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent className='w-full max-w-96'>
                <AlertDialogHeader>
                    <AlertDialogTitle>Profile Info</AlertDialogTitle>
                </AlertDialogHeader>
                <form className='flex flex-col gap-5' onSubmit={submitUpdateProfile}>
                    <div className='flex flex-col gap-2'>
                        <Label>Email</Label>
                        <Input type='email' required value={userProfile?.email || ''} name='email' onChange={handleChange} />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <Label>Phishing Code</Label>
                        <Input required value={userProfile?.phishing_code || ''} name='phishing_code' onChange={handleChange} />
                    </div>
                    <div className='flex items-center w-full justify-between'>
                        <Button type='button' className='w-36' variant={'ghost'} onClick={() => setOpen(false)}>Close</Button>
                        <Button className='w-36'>
                            {updateProfile.isPending ?
                                <FontAwesomeIcon icon={faSpinner} width={16} height={16} className='animate-spin' />
                                : 'Update'}
                        </Button>
                    </div>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default ProfilePage