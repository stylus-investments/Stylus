'use client'
import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { trpc } from '@/app/_trpc/client'
import { toast } from 'sonner'
import { Copy, LoaderCircle } from 'lucide-react'

const ReferralInfo = () => {

    const [formData, setFormData] = useState({
        account_number: '',
        account_name: ''
    })

    const { mutateAsync, isPending } = trpc.referral.updateReferralPaymentInfo.useMutation({
        onSuccess: () => {
            toast.success("Success! Payment info updated.")
        },
        onError: (err) => {
            toast.error(err.message)
        }
    })

    const { refetch, data } = trpc.referral.getUserReferralInfo.useQuery()
    const getPayouts = trpc.referral.getPayoutHistory.useQuery(undefined, {
        enabled: false,
        refetchOnMount: false
    })
    const getRewards = trpc.referral.getReferals.useQuery(undefined, {
        enabled: false,
        refetchOnMount: false
    })

    const withdrawReferralReward = trpc.referral.withdrawReferralRewards.useMutation({
        onSuccess: () => {
            toast.success("Success! payout is requested.")
            refetch()
            getRewards.refetch()
            getPayouts.refetch()
        },
        onError: (err) => {
            toast.error(err.message)
        }
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const updatePaymentInfo = async (e: React.FormEvent) => {
        e.preventDefault()
        try {

            const { account_name, account_number } = formData

            if (!account_name || account_name.length < 3) return toast.error("Account name is invalid")
            if (!account_number || account_number.length !== 11) return toast.error("Account number is invalid")

            await mutateAsync({ account_number, account_name })

        } catch (error) {
            console.log(error);
            alert("Something went wrong")
        }
    }

    const copyReferralLink = () => {
        navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_URL}/join/${data?.referral_code}`)
        toast.success("Referral Link Copied.")
    }

    useEffect(() => {
        setFormData({
            account_name: data?.payment_account_name || "",
            account_number: data?.payment_account_number || ""
        })
    }, [data])

    return (
        <div className='flex flex-col md:flex-row justify-center gap-5 w-full lg:w-4/5 2xl:w-2/3'>
            <Card className='w-full'>
                <CardContent className='pt-4 flex flex-col gap-4 w-full'>
                    <div className='flex flex-col gap-3'>
                        <div className='flex items-center gap-5'>
                            <div className='flex flex-col gap-1.5 w-full'>
                                <Label >Total Rewards</Label>
                                <Input value={`₱ ${data?.total_reward || 0}`} readOnly />
                            </div>
                            <div className='flex flex-col gap-1.5 w-full'>
                                <Label>Unclaimed Rewards</Label>
                                <Input readOnly value={`₱ ${data?.unclaimed_reward || 0}`} />
                            </div>
                        </div>
                        <div className='flex flex-col gap-1.5 w-full'>
                            <Label>Referral Link</Label>
                            <div className='w-full relative cursor-pointer' onClick={copyReferralLink}>
                                <Input value={`${process.env.NEXT_PUBLIC_URL}/join/${data?.referral_code || "loading"}`} readOnly className='cursor-pointer' />
                                <Copy size={20} className='w-10 bg-card absolute px-3 top-3 right-3 cursor-pointer text-primary' />
                            </div>
                        </div>
                        <div className='flex items-center gap-5 w-full pt-2'>
                            <Button className='w-full' variant={'secondary'} onClick={copyReferralLink}>Copy Link</Button>
                            {/* <Button
                                disabled={withdrawReferralReward.isPending}
                                className='w-full'
                                onClick={async () => {

                                    const now = new Date();
                                    const month = now.getMonth();

                                    const lastDayOfMonth = new Date(now.getFullYear(), month + 1, 0).getDate();

                                    const isQuarterEnd = (month === 2 || month === 5 || month === 8 || month === 11) && now.getDate() === lastDayOfMonth;

                                    if (!isQuarterEnd) {
                                        return toast.error("Withdrawals can only be made on the last day of the month at the end of each quarter.");
                                    }
                                    if (data.unclaimed_reward < 100) return toast.error("Minimum payout is ₱100")
                                    await withdrawReferralReward.mutateAsync()

                                }}>
                                {withdrawReferralReward.isPending ? <LoaderCircle size={18} className='animate-spin' /> : "Withdraw"}
                            </Button> */}
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className='w-full'>
                <CardContent className='pt-4 w-full'>
                    <form className='flex flex-col gap-3' onSubmit={updatePaymentInfo}>
                        <div className='flex items-center gap-5'>
                            <div className='flex flex-col gap-1.5'>
                                <Label htmlFor='payment_method'>Method</Label>
                                <Input value={data?.payment_method || "loading"} readOnly />
                            </div>
                            <div className='flex flex-col gap-1.5 w-full'>
                                <Label htmlFor='account_number'>Account Number</Label>
                                <Input name='account_number' type='number' value={formData.account_number} onChange={handleChange} />
                            </div>
                        </div>
                        <div className='flex flex-col gap-1.5 w-full'>
                            <Label htmlFor='account_name'>Account Name</Label>
                            <Input name='account_name' value={formData.account_name} onChange={handleChange} />
                        </div>

                        <div className='flex items-center gap-5 w-full pt-2'>
                            <Button className='w-full lg:w-1/2 lg:ml-auto' disabled={isPending}>{isPending ? <LoaderCircle className='animate-spin' size={18} /> : "Update"}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default ReferralInfo