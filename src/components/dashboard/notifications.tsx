'use client'
import React, { useEffect } from 'react'
import { Button } from '../ui/button'
import { BellIcon } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Label } from '../ui/label'
import { Separator } from '../ui/separator'
import { trpc } from '@/app/_trpc/client'
import { toast } from 'sonner'
import { socket } from '@/lib/socket'
import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'

//notification need improvements to prevent refetching

const Notifications = () => {

    const { user } = usePrivy()
    const router = useRouter()
    const { data, refetch } = trpc.notification.getNotifications.useQuery()

    const { mutateAsync } = trpc.notification.readAllNotif.useMutation({
        onSuccess: () => {
            refetch()
        },
        onError: (err) => {
            toast.error(err.message)
        }
    })

    const updateNotif = trpc.notification.seenNotif.useMutation({
        onError: (err) => {
            toast.error(err.message)
        }
    })

    const clickNotif = async ({ link, id, seen }: { link: string | null, id: string, seen: boolean }) => {

        if (!seen) {
            await updateNotif.mutateAsync({
                notif_id: id
            })
        }
        refetch()
        if (link) {
            router.push(link)
        }
    }

    useEffect(() => {

        socket.connect()
        if (user) {
            socket.emit("listen", { user_id: user.id })
        }
        socket.on("new-notif", () => {
            refetch()
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    const unseenCount = data ? data.filter(item => !item.seen).length : 0;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className='relative'>
                    <Button variant={'ghost'} className='px-2.5'>
                        <BellIcon size={25} />
                    </Button>
                    {unseenCount > 0 &&
                        <div className='absolute -left-1 -top-1 bg-primary text-sm font-black h-6 w-6 flex items-center justify-center rounded-bl-full rounded-t-full'>
                            {unseenCount}
                        </div>}
                </div>
            </DropdownMenuTrigger>
            {data && data.length > 0 ? <DropdownMenuContent className='max-w-96 min-w-52'>
                <div className='relative h-full py-5'>
                    <Separator />
                    <DropdownMenuLabel className='text-base text-primary absolute left-1/2  transform -translate-x-1/2 -translate-y-1/2 bg-card'>
                        Notifications
                    </DropdownMenuLabel>
                </div>
                {data.map(notif => (
                    <DropdownMenuItem key={notif.id} className={`my-3 px-3 ${notif.seen ? "text-muted-foreground" : "text-foreground"}`} onClick={async () => {
                        await clickNotif({
                            seen: notif.seen,
                            id: notif.id,
                            link: notif.link
                        })
                    }}>
                        <div className='flex flex-col gap-2'>
                            <Label>{notif.message}</Label>
                            <div className='w-full flex items-center justify-between'>
                                <small>{notif.from}</small>
                                <small>{new Date(notif.created_at).toISOString().split("T")[0]}</small>
                            </div>
                        </div>
                    </DropdownMenuItem>
                ))}
                < DropdownMenuSeparator />
                <DropdownMenuItem className='flex justify-center w-full' onClick={async () => await mutateAsync()}>
                    Read All
                </DropdownMenuItem>
            </DropdownMenuContent> :
                <DropdownMenuContent className='max-w-96 min-w-52'>
                    <DropdownMenuItem className='flex justify-center'>No Notifications</DropdownMenuItem>
                </DropdownMenuContent>
            }
        </DropdownMenu >

    )
}

export default Notifications