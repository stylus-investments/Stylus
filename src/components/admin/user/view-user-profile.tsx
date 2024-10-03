import { trpc } from '@/app/_trpc/client'
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { DropdownMenuShortcut } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { socket } from '@/lib/socket'
import useGlobalStore from '@/state/globalStore'
import { ProfileStatus, user_info } from '@prisma/client'
import { Ban, CircleCheckBig, CircleOff, Clock, LoaderCircle, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

const ViewUserProfile = ({ user }: {
  user: user_info
}) => {

  const [open, setOpen] = useState(false)

  const returnStatus = () => {
    if (user?.status) {
      switch (user.status) {
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

  useEffect(() => {
    socket.connect()
    return () => {
      socket.disconnect()
    }
  }, [])

  const { copyText } = useGlobalStore()

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <div className='flex w-full items-center justify-between px-2 py-2 hover:bg-muted rounded-md'>
          <Label>Profile</Label>
          <DropdownMenuShortcut>
            <User size={18} />
          </DropdownMenuShortcut>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent className='flex flex-col gap-5 max-h-[550px] overflow-y-auto'>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center w-full justify-between'>
            <h1>User Profile</h1>
            {returnStatus()}
          </AlertDialogTitle>        </AlertDialogHeader>
        <div className='flex flex-col gap-5'>
          <div className='flex flex-col w-full gap-1.5'>
            <Label>Wallet Address</Label>
            <Input readOnly value={user?.wallet} onClick={() => copyText(user?.wallet || "")} />
          </div>
          <div className='flex items-center gap-5'>
            <div className='flex flex-col w-full gap-1.5'>
              <Label htmlFor='first_name'>First Name</Label>
              <Input readOnly placeholder='First name' value={user.first_name} />
            </div>
            <div className='flex flex-col w-full gap-1.5'>
              <Label htmlFor='last_name'>Last Name</Label>
              <Input readOnly placeholder='Last name' value={user.last_name} />
            </div>
          </div>
          <div className='flex flex-col w-full gap-1.5'>
            <Label htmlFor='email'>Email</Label>
            <Input readOnly type='email' placeholder='Email address' value={user.email} />
          </div>
          <div className='flex flex-col w-full gap-1.5'>
            <Label htmlFor='mobile'>Phone Number</Label>
            <Input readOnly type='number' placeholder='Phone Number' value={user.mobile} />
          </div>
          <div className='flex items-center gap-5'>
            <div className='flex flex-col w-full gap-1.5'>
              <Label htmlFor='age'>Age</Label>
              <Input readOnly placeholder='Age' type='number' value={user.age} />
            </div>
            <div className='flex flex-col w-full gap-1.5'>
              <Label htmlFor='birth_date'>Birth  Date</Label>
              <Input readOnly type='date' value={user.birth_date.toISOString().split('T')[0]} />
            </div>
          </div>
          <div className='flex flex-col w-full gap-1.5'>
            <Label>Uploaded ID</Label>
            <div className='flex items-center gap-3 overflow-x-auto py-2 w-full'>
              <Link href={user.front_id || '/admin/user'} target='_blank' className='w-full'>
                <Image src={user.front_id || '/qrpay.jpeg'} alt='Image' width={300} height={50} className='w-full object-contain h-32 cursor-pointer rounded-md border border-primary' />
              </Link>
              <Link href={user.back_id || '/admin/user'} target='_blank' className='w-full'>
                <Image src={user.back_id || '/qrpay.jpeg'} alt='Image' width={300} height={50} className='object-contain w-full h-32 cursor-pointer rounded-md border border-primary' />
              </Link>
            </div>
          </div>
        </div>
        <AlertDialogFooter className='flex items-center gap-5 pt-5 border-t'>
          <div className='flex items-center gap-2 w-full'>
            <UpdateUserStatus user_id={user.user_id} status={ProfileStatus.INVALID} />
            <UpdateUserStatus user_id={user.user_id} status={ProfileStatus.VERIFIED} />
          </div>
          <AlertDialogCancel className='w-full'>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const UpdateUserStatus = ({ user_id, status }: {
  user_id: string
  status: ProfileStatus
}) => {

  const router = useRouter()
  const [open, setOpen] = useState(false)

  const { mutateAsync, isPending } = trpc.user.updateUserStatus.useMutation({
    onSuccess: () => {
      socket.emit("new-notif", { user_id })
      toast.success(`Success! this user is ${status.toLocaleLowerCase()}.`)
      router.refresh()
      setOpen(false)
    },
    onError(error) {
      toast.error(error.message)
    },
  })


  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {status === 'VERIFIED' ? <Button className='w-full bg-green-600 hover:bg-green-500'>
          <CircleCheckBig size={18} className='mr-1' />
          Verify
        </Button> :
          <Button variant={'destructive'} className='w-full'>
            <Ban size={18} className='mr-1' />
            Invalid</Button>
        }
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{status === 'VERIFIED' ? "Verify" : "Invalid"} User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you user to {status === 'VERIFIED' ? "verify" : "invalid"} this user?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button disabled={isPending} onClick={async () => {
            await mutateAsync({
              user_id,
              status
            })
          }} variant={status === 'VERIFIED' ? "default" : "destructive"}>{isPending ? <LoaderCircle className='animate-spin' size={18} /> : "Yes I'm Sure"}</Button>
          <AlertDialogCancel>No Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ViewUserProfile