'use client'
import { caller } from '@/app/_trpc/server'
import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { trpc } from '@/app/_trpc/client'
import { toast } from 'sonner'
import { Copy, LoaderCircle } from 'lucide-react'

const ReferralInfo = ({ initialData }: {
    initialData: Awaited<ReturnType<typeof caller['referral']['getUserReferralInfo']>>
}) => {

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

    const { refetch, data } = trpc.referral.getUserReferralInfo.useQuery(undefined, {
        refetchOnMount: false,
        enabled: false,
        initialData: initialData
    })
    const getPayouts = trpc.referral.getPayoutHistory.useQuery(undefined, {
        enabled: false,
        refetchOnMount: false
    })

    const withdrawReferralReward = trpc.referral.withdrawReferralRewards.useMutation({
        onSuccess: () => {
            toast.success("Success! payout is requested.")
            refetch()
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
        navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_URL}/join/${initialData.referral_code}`)
        toast.success("Referral Link Copied.")
    }

    useEffect(() => {
        setFormData({
            account_name: initialData.payment_account_name,
            account_number: initialData.payment_account_number
        })
    }, [initialData])

    return (
        <div className='flex flex-col md:flex-row justify-center gap-5 w-full'>
            <Card className='w-full'>
                <CardContent className='pt-4 flex flex-col gap-4 w-full'>
                    <div className='flex flex-col gap-3'>
                        <div className='flex items-center gap-5'>
                            <div className='flex flex-col gap-1.5 w-full'>
                                <Label >Total Rewards</Label>
                                <Input value={`₱${data.total_reward}`} readOnly />
                            </div>
                            <div className='flex flex-col gap-1.5 w-full'>
                                <Label>Unclaimed Rewards</Label>
                                <Input readOnly value={`₱${data.unclaimed_reward}`} />
                            </div>
                        </div>
                        <div className='flex flex-col gap-1.5 w-full'>
                            <Label>Referral Link</Label>
                            <div className='w-full relative cursor-pointer' onClick={copyReferralLink}>
                                <Input value={`${process.env.NEXT_PUBLIC_URL}/join/${data.referral_code}`} readOnly className='cursor-pointer' />
                                <Copy size={20} className='w-10 bg-card absolute px-3 top-3 right-3 cursor-pointer text-primary' />
                            </div>
                        </div>
                        <div className='flex items-center gap-5 w-full pt-2'>
                            <Button className='w-full' variant={'secondary'} onClick={copyReferralLink}>Copy Link</Button>
                            <Button
                                disabled={withdrawReferralReward.isPending}
                                className='w-full'
                                onClick={async (e) => {
                                    e.preventDefault()
                                    if (data.unclaimed_reward < 100) return toast.error("Minimum payout is ₱100")
                                    await withdrawReferralReward.mutateAsync()
                                }}>
                                {withdrawReferralReward.isPending ? <LoaderCircle size={18} className='animate-spin' /> : "Withdraw"}
                            </Button>
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
                                <Input value={data.payment_method} readOnly />
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
                            <Button className='w-full' disabled={isPending}>{isPending ? <LoaderCircle className='animate-spin' size={18} /> : "Update"}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default ReferralInfo