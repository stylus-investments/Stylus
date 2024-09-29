'use client'
import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import usePaginationStore from '@/state/paginationStore';
import { Card, CardContent } from '@/components/ui/card';
import TablePagination from '../table-pagination';
import { trpc } from '@/app/_trpc/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { socket } from '@/lib/socket';

const ReferralsTable = () => {

    const { data, isLoading } = trpc.referral.getReferals.useQuery(undefined, {
        refetchOnMount: false
    })

    const pokeUser = trpc.notification.pokeUser.useMutation({
        onSuccess: (data) => {
            toast.success("Success! poke send")
            socket.emit("new-notif", { user_id: data.user_id })

            const previousPokes = localStorage.getItem("poke")
            if (previousPokes) {
                const parsePokes = JSON.parse(previousPokes) as {
                    user_id: string,
                    date: Date
                }[];

                const findUserPokeIndex = parsePokes.findIndex(poke => poke.user_id === data.user_id);

                if (findUserPokeIndex !== -1) {
                    const now = new Date();
                    const pokeDate = new Date(parsePokes[findUserPokeIndex].date);

                    const isThirtyDaysOrMore = now >= new Date(pokeDate.getTime() + 30 * 24 * 60 * 60 * 1000);

                    if (isThirtyDaysOrMore) {
                        // Update the existing poke entry's date
                        parsePokes[findUserPokeIndex].date = now;

                        // Save the updated pokes back to localStorage
                        localStorage.setItem("poke", JSON.stringify(parsePokes));
                    }

                } else {
                    // No previous poke for this user, allow the poke
                    localStorage.setItem("poke", JSON.stringify([...parsePokes, {
                        user_id: data.user_id,
                        date: new Date()
                    }]));
                }
            } else {
                // First poke for this user
                localStorage.setItem("poke", JSON.stringify([{
                    user_id: data.user_id,
                    date: new Date()
                }]));
            }
        },
        onError: (err) => {
            toast.error(err.message)
        }
    })

    const returnPokeButton = (user_id: string) => {

        const previousPokes = localStorage.getItem("poke")

        if (previousPokes) {

            const parsePokes = JSON.parse(previousPokes) as {
                user_id: string,
                date: Date
            }[]

            const findUserPoke = parsePokes.find(poke => poke.user_id === user_id)

            if (findUserPoke) {

                const now = new Date
                const pokeDate = new Date(findUserPoke.date);

                const isThirtyDaysOrMore = now >= new Date(pokeDate.getTime() + 30 * 24 * 60 * 60 * 1000);

                if (!isThirtyDaysOrMore) {
                    return (
                        <Button disabled className='h-7' variant={'secondary'}>
                            Poke!
                        </Button>
                    )
                }
            }
        }

        return (
            <Button disabled={pokeUser.isPending} className='h-7' onClick={async () => pokeUser.mutateAsync({
                user_id: user_id
            })}>Poke!</Button>
        )
    }

    const [currentTable, setCurrentTable] = useState<{
        email: string
        user_id: string
        created_at: Date
        totalPlans: number
        reward: number
        unpaidPlans: number
    }[] | undefined>(undefined)

    const { getCurrentData, currentPage } = usePaginationStore()

    useEffect(() => {

        setCurrentTable(getCurrentData(data))

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, currentPage])

    return (
        <>
            {isLoading ? <ReferalTableSkeleton /> :
                <Card>
                    <CardContent className='flex flex-col gap-2'>
                        <Table>
                            <TableHeader>
                                <TableRow className='text-xs sm:text-sm'>
                                    <TableHead className='min-w-40'>Email</TableHead>
                                    <TableHead className='min-w-28'>Total Plans</TableHead>
                                    <TableHead className='min-w-28'>Unpaid Plans</TableHead>
                                    <TableHead className='min-w-28'>Reward (sPHP)</TableHead>
                                    <TableHead className='min-w-32'>Operation</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentTable && currentTable.length > 0 ?
                                    currentTable.map((user, i) => (
                                        <TableRow key={i} className='text-muted-foreground hover:text-foreground text-xs md:text-sm'>
                                            <TableCell>
                                                {`${user.email.slice(0, 4)}****${user.email.slice(8, -10)}`}@{user.email.split('@')[1]}
                                            </TableCell>
                                            <TableCell>{user.totalPlans}</TableCell>
                                            <TableCell>{user.unpaidPlans}</TableCell>
                                            <TableCell>{user.reward}</TableCell>
                                            <TableCell>
                                                {returnPokeButton(user.user_id)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                    :
                                    <TableRow>
                                        <TableCell>No Data</TableCell>
                                    </TableRow>
                                }
                            </TableBody>
                        </Table>
                        <div className='w-full text-center text-xs sm:text-sm text-muted-foreground'>Referral Rewards</div>
                        <TablePagination data={data || []} />
                    </CardContent>
                </Card>
            }
        </>
    )
}

const ReferalTableSkeleton = () => {

    return (
        <Card>
            <CardContent className='flex flex-col gap-2'>
                <Table>
                    <TableHeader>
                        <TableRow className='text-xs sm:text-sm'>
                            <TableHead className='min-w-44'>Name</TableHead>
                            <TableHead className='min-w-28'>Total Plans</TableHead>
                            <TableHead className='min-w-28'>Unpaid Plans</TableHead>
                            <TableHead className='min-w-28'>Reward (sPHP)</TableHead>
                            <TableHead className='min-w-32 text-right'>Operation</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[1, 2, 3, 4, 5, 6, 7].map(skel => (
                            <TableRow key={skel} className='text-muted-foreground hover:text-foreground text-xs md:text-sm'>
                                <TableCell>
                                    <Skeleton className='w-44 h-7' />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className='w-24 h-7' />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className='w-24 h-7' />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className='w-24 h-7' />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className='w-24 h-7' />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className='w-full text-center text-xs sm:text-sm text-muted-foreground'>Referral Rewards</div>
                <TablePagination data={[]} />
            </CardContent>
        </Card>
    )
}

export default ReferralsTable