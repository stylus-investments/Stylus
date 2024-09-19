'use client'
import { trpc } from '@/app/_trpc/client'
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { CircleCheckBig, LoaderCircle } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

const CreateInvestment = () => {

    const [open, setOpen] = useState(false)

    const [selectedDuration, setSelectedDuration] = useState(0)
    const { data } = trpc.package.getAllPackages.useQuery('USER')

    const createInvestmentPlan = trpc.investment.createUserInvestmentPlan.useMutation({
        onSuccess: () => {
            toast.success("Success! investment plan created.")
            setOpen(false)
            window.location.href = '/dashboard/wallet/plans'
        },
        onError: (err) => {
            toast.error(err.message)
        }
    })

    const [formData, setFormData] = useState({
        name: '',
        base_price: 0,
        total_price: 0,
        profit_protection: false,
        package_id: '',
        insurance: false
    })

    const createInvestment = async (e: React.FormEvent) => {

        e.preventDefault()

        const { base_price, package_id, name } = formData

        if (!name) return toast.error("Name is required")
        if (!package_id) return toast.error("Select Investment Duration")
        if (!base_price) return toast.error("Select Amount ")

        await createInvestmentPlan.mutateAsync(formData)

    }

    useEffect(() => {

        if (data && data.length > 0 && formData.package_id) {
            const selectedPackage = data.find(obj => obj.id === formData.package_id);

            if (selectedPackage) {

                let health_insurance: number = 300

                if (selectedPackage.duration === 20) {
                    const newTotalPrice = formData.base_price + health_insurance
                    return setFormData(prev => ({ ...prev, total_price: formData.insurance ? newTotalPrice : prev.base_price, profit_protection: true, insurance: formData.insurance }))
                }

                if (selectedPackage.duration === 10) {
                    const isProfitProtectionEnable = formData.profit_protection ? formData.base_price * 1.25 : formData.base_price
                    const finalPrice = formData.insurance ? isProfitProtectionEnable + health_insurance : isProfitProtectionEnable
                    return setFormData(prev => ({ ...prev, total_price: finalPrice, insurance: formData.insurance, profit_protection: formData.profit_protection }))
                }

                if (selectedPackage.duration === 5) {
                    return setFormData(prev => ({ ...prev, total_price: prev.base_price, insurance: false, profit_protection: false }))
                }
            }
        }

    }, [data, formData.package_id, formData.insurance, formData.profit_protection, formData.base_price]);

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button className='w-full'>Create Plan</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Create Investment Plan</AlertDialogTitle>
                </AlertDialogHeader>
                <form className='flex flex-col gap-5' onSubmit={createInvestment}>

                    <div className='flex items-center w-full gap-5'>

                        <div className='flex flex-col gap-1.5 w-full'>
                            <Label>Name</Label>
                            <Input
                                value={formData.name}
                                required
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} />
                        </div>
                        <div className='flex flex-col gap-1.5 w-full'>
                            <Label>Duration</Label>
                            <Select required value={formData.package_id} onValueChange={(val) => {

                                const selectedPackage = data?.find(pkg => pkg.id === val)?.duration
                                setSelectedDuration(selectedPackage || 0)
                                setFormData(prev => ({ ...prev, package_id: val, base_price: 0 }))
                            }
                            }>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Package" />
                                </SelectTrigger>
                                <SelectContent>
                                    {data && data.length > 0 ? data.map(pckg => (
                                        <SelectItem key={pckg.id} value={pckg.id}>{pckg.duration} Years</SelectItem>
                                    )) : null}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {data && data.length > 0 && formData.package_id && data.map(obj => {
                        if (obj.id === formData.package_id) {
                            return (
                                <div key={obj.id} className='flex items-center gap-5 w-full'>
                                    {obj.prices.map((price, i) => (
                                        <Label key={i}
                                            onClick={() => setFormData(prev => ({ ...prev, base_price: price }))}
                                            className={`${formData.base_price === price ? "bg-primary" : "bg-muted"} w-full text-center rounded-md py-2.5 cursor-pointer`}>
                                            ₱{price}</Label>
                                    ))}
                                </div>
                            )
                        }
                    })}
                    <div className='relative py-5'>
                        <Separator />
                        <Label className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-5 bg-card lg:text-base">PERKS</Label>
                    </div>
                    {formData.package_id && <Link target='_blank' href={'/'} className='text-primary underline text-sm font-bold'>Full Disclosure of Perks</Link>}
                    {data && data.length > 0 && formData.package_id && data.map(obj => {
                        if (obj.id === formData.package_id) {
                            return (
                                <div key={obj.id} className='flex flex-col gap-2.5 w-full'>
                                    {obj.perks.map((perk, i) => (
                                        <div key={i} className='flex items-center gap-2'>
                                            <CircleCheckBig size={16} />
                                            <Label className='text-muted-foreground'>{perk}</Label>
                                        </div>
                                    ))}
                                </div>
                            )
                        }
                    })}
                    {data && data.length > 0 && formData.package_id && data.map(obj => {

                        if (obj.id === formData.package_id) {

                            if (obj.duration >= 20) {

                                return (
                                    <div className='flex flex-col gap-5 w-full' key={obj.id}>
                                        <div className='flex flex-col gap-1.5'>
                                            <div className='flex w-full items-center gap-3'>
                                                <Switch id='insurance' checked={formData.insurance} onCheckedChange={(bol) => setFormData(prev => ({ ...prev, insurance: bol }))} />
                                                <Label htmlFor='insurance'>Insurance</Label>
                                            </div>
                                            <small className='text-muted-foreground'>
                                                +300 (200k hospitalization coverage + annual physical exam)
                                            </small>
                                        </div>
                                        <div className='flex w-full items-center gap-3'>
                                            <Switch id='profit_protection' checked={true} disabled />
                                            <Label htmlFor='profit_protection'>Profit Protection</Label>
                                        </div>
                                    </div>
                                )
                            }

                            if (obj.duration >= 10) {
                                return (
                                    <div className='flex flex-col gap-5 w-full' key={obj.id}>
                                        <div className='flex flex-col gap-1.5'>
                                            <div className='flex w-full items-center gap-3'>
                                                <Switch id='insurance' checked={formData.insurance} onCheckedChange={(bol) => setFormData(prev => ({ ...prev, insurance: bol }))} />
                                                <Label htmlFor='insurance'>Insurance</Label>
                                            </div>
                                            <small className='text-muted-foreground'>
                                                +300 (200k hospitalization coverage + annual physical exam)
                                            </small>
                                        </div>
                                        <div className='flex flex-col gap-1.5'>
                                            <div className='flex w-full items-center gap-3'>
                                                <Switch id='profit_protection' checked={formData.profit_protection} onCheckedChange={(bol) => setFormData(prev => ({ ...prev, profit_protection: bol }))} />
                                                <Label htmlFor='profit_protection'>Profit Protection</Label>
                                            </div>
                                            <small className='text-muted-foreground'>Just add 25% of the base payment.
                                            </small>
                                        </div>
                                    </div>
                                )
                            }
                        }

                    })}
                    <div className='flex items-center justify-between w-full pt-5 border-t'>
                        <Label>{data && data.map(obj => {
                            if (obj.id === formData.package_id) {
                                return (
                                    <span key={obj.id} className='mr-1'>{obj.billing_cycle}</span>
                                )
                            }
                        })}
                            Payment</Label>
                        <h1 className='text-xl font-[1000]'>₱ {formData.total_price}</h1>
                    </div>
                    <Separator />
                    {formData.base_price ? <div className='flex w-full items-center gap-5'>
                        <Checkbox id='agree' required className='w-5 h-5' />
                        <Label htmlFor='agree'>With this plan, I agree to be paying {formData.total_price} PHP per month for the next {selectedDuration} years with the agreed benefits previewed on the plan creation</Label>
                    </div> : null}
                    <AlertDialogFooter className=' w-full flex-row flex items-center gap-10'>
                        <Button className='w-full' variant={'secondary'} type='button' onClick={() => setOpen(false)}>Close</Button>
                        <Button className='w-full' disabled={createInvestmentPlan.isPending}>{createInvestmentPlan.isPending ? <LoaderCircle size={18} className='animate-spin' /> : "Create"}</Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default CreateInvestment