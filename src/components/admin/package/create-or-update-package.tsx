'use client'
import { trpc } from '@/app/_trpc/client'
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { $Enums } from '@prisma/client'
import { LoaderCircle, Settings2, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

type BillingCycle = "DAILY" | "WEEKLY" | "MONTHLY";
type Currency = "PHP" | "USD" | "EUR"
const formInitialData = {
    name: "",
    perks: [],
    billing_cycle: 'MONTHLY',
    currency: "PHP",
    prices: [],
    duration: 0,
} as {
    name: string
    perks: string[]
    prices: number[]
    duration: number
    billing_cycle: "DAILY" | "WEEKLY" | "MONTHLY"
    currency: "PHP" | "USD" | "EUR"
}

const CreateOrUpdatePackage = ({ pckg, type }: {
    type: "Create" | "Update"
    pckg?: {
        id: string;
        name: string;
        duration: number;
        currency: Currency;
        billing_cycle: $Enums.BillingCycle;
        prices: number[];
        perks: string[];
    }
}) => {

    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState(formInitialData)

    const [perksInput, setPerksInput] = useState('')
    const [priceInput, setPriceInput] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const whatShouldICallThis = ({
        type, name, value
    }: {
        type: "add" | "remove"
        name: "perks" | "price",
        value: string
    }) => {

        if (type === 'remove') {

            if (name === 'perks') {
                setFormData(prev => ({
                    ...prev, perks: prev.perks.filter(existingPerk => existingPerk !== value)
                }))
            } else {
                setFormData(prev => ({
                    ...prev, prices: prev.prices.filter(existingPerk => existingPerk !== Number(value))
                }))
            }
        } else {
            if (name === 'perks') {
                if (!perksInput) return toast.error("Pekrs input is required")
                setFormData(prev => ({ ...prev, perks: [...prev.perks, perksInput] }))
                setPerksInput('')
            } else {
                if (!priceInput) return toast.error("Price input is required")
                setFormData(prev => ({ ...prev, prices: [...prev.prices, Number(priceInput)] }))
                setPriceInput('')
            }
        }
    }

    const getAllPackages = trpc.package.getAllPackages.useQuery('ADMIN', {
        enabled: false
    })

    const createPackage = trpc.package.createPackage.useMutation({
        onSuccess: () => {
            setOpen(false),
                getAllPackages.refetch()
            toast.success("Success! package created.")
            setFormData(formInitialData)
        },
        onError: (err) => {
            toast.error(err.message)
        }
    })

    const updatePackage = trpc.package.updatePackage.useMutation({
        onSuccess: () => {
            setOpen(false)
            getAllPackages.refetch()
            toast.success("Success! package updated.")
            setFormData(formInitialData)
        },
        onError: (err) => {
            toast.error(err.message)
        }
    })

    const createOrUpdatePackage = async (e: React.FormEvent) => {
        try {

            e.preventDefault()

            const { perks, name, prices, duration, billing_cycle, currency } = formData

            if (perks.length < 1) return toast.error("Put atlest 1 perks")
            if (prices.length < 1) return toast.error("Put ateast 1 prices")
            if (!name) return toast.error("Name is required")
            if (!duration) return toast.error("Duration is required")

            const modifyPrices = prices.map(price => Number(price))

            const data = {
                perks: perks,
                name,
                prices: modifyPrices,
                duration: Number(duration),
                billing_cycle,
                currency
            }

            if (type === 'Update' && pckg) {
                await updatePackage.mutateAsync({ ...data, package_id: pckg.id })
            } else {
                await createPackage.mutateAsync(data)
            }

        } catch (error) {
            console.log(error);
            toast.error("Something went wrong")
        }
    }

    useEffect(() => {

        if (pckg) setFormData(pckg)

    }, [pckg])

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                {type === 'Update' ?
                    <Settings2 size={25} className='cursor-pointer' />
                    :
                    <Button>{type} Package</Button>
                }
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{type} Package</AlertDialogTitle>
                </AlertDialogHeader>
                <form className='w-full flex flex-col gap-4' onSubmit={createOrUpdatePackage}>
                    <div className='w-full flex flex-col gap-1.5'>
                        <Label>Package Name</Label>
                        <Input required onChange={handleChange} value={formData.name} name="name" />
                    </div>
                    <div className='flex items-center gap-5'>
                        <div className='w-full flex flex-col gap-1.5'>
                            <Label>Duration (Years)</Label>
                            <Input required type='number' onChange={handleChange} value={formData.duration} name="duration" />
                        </div>
                        <div className='w-full flex flex-col gap-1.5'>
                            <Label>Billing Cycle</Label>
                            <Select value={formData.billing_cycle} onValueChange={(val) => {
                                if (["DAILY", "WEEKLY", "MONTHLY"].includes(val)) {
                                    setFormData(prev => ({ ...prev, billing_cycle: val as BillingCycle }))
                                }
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select cycle" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value='DAILY'>Daily</SelectItem>
                                        <SelectItem value='WEEKLY'>Weekly</SelectItem>
                                        <SelectItem value='MONTHLY'>Monthly</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className='flex items-center gap-5'>
                    </div>
                    <div className='relative py-5'>
                        <Separator />
                        <Label className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-5 bg-card lg:text-base">PRICES</Label>
                    </div>
                    <div className='flex items-center gap-5 pb-5'>
                        <Input value={priceInput} type='number' onChange={(e) => setPriceInput(e.target.value)} placeholder='Add base price' />
                        <Button type='button' onClick={() => whatShouldICallThis({ type: 'add', name: 'price', value: "" })}>Add Price</Button>
                    </div>
                    <div className='flex flex-wrap w-full gap-3'>
                        {formData.prices.map((price, i) => (
                            <div className='px-3 py-2 bg-secondary cursor-pointer flex items-start gap-2' key={i} onClick={() => whatShouldICallThis({ type: 'remove', name: "price", value: String(price) })} >
                                <Label>
                                    {price}
                                </Label>
                                <X size={16} className='text-primary' />
                            </div>
                        ))}
                    </div>
                    <div className='relative py-5'>
                        <Separator />
                        <Label className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-5 bg-card lg:text-base">PERKS</Label>
                    </div>
                    <div className='flex items-center gap-5 pb-5'>
                        <Input value={perksInput} onChange={(e) => setPerksInput(e.target.value)} placeholder='Write down some perks...' />
                        <Button type='button' onClick={() => whatShouldICallThis({ type: 'add', name: "perks", value: "" })}>Add Perks</Button>
                    </div>
                    <div className='flex flex-wrap w-full gap-3'>
                        {formData.perks.map((perks, i) => (
                            <div className='px-3 py-2 bg-secondary cursor-pointer flex items-start gap-2' key={i} onClick={() => whatShouldICallThis({ type: 'remove', name: "perks", value: perks })}>
                                <Label>
                                    {perks}
                                </Label>
                                <X size={16} className='text-primary' />
                            </div>
                        ))}
                    </div>
                    <AlertDialogFooter className='flex items-center flex-row w-full gap-5'>
                        <Button
                            onClick={() => setOpen(false)}
                            variant={'secondary'}
                            className='w-full'
                            type='button'>Close</Button>
                        {type === 'Create' ?
                            <Button className='w-full' disabled={createPackage.isPending}>{createPackage.isPending ? <LoaderCircle className='animate-spin' size={18} /> : "Create"}</Button>
                            :
                            <Button className='w-full' disabled={updatePackage.isPending}>{updatePackage.isPending ? <LoaderCircle className='animate-spin' size={18} /> : "Update"}</Button>

                        }
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default CreateOrUpdatePackage