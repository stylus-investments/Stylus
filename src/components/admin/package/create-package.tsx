'use client'
import { trpc } from '@/app/_trpc/client'
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { LoaderCircle, Monitor, X } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'

const CreatePackage = () => {

    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState<{
        name: string
        perks: string[]
        monthly_payment: number
        duration: number,
        currency: string
    }>({
        name: "",
        perks: [],
        monthly_payment: 0,
        duration: 0,
        currency: 'PHP',
    })

    const [perksInput, setPerksInput] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const addPerks = () => {
        if (!perksInput) return toast.error("Pekrs input is required")
        setFormData(prev => ({ ...prev, perks: [...prev.perks, perksInput] }))
        setPerksInput('')
    }

    const removePerks = (perk: string) => {
        setFormData(prev => ({
            ...prev,
            perks: prev.perks.filter(existingPerk => existingPerk !== perk)
        }));
    }

    const { mutateAsync, isPending } = trpc.package.createPackage.useMutation({
        onSuccess: () => {
            setOpen(false),
                toast.success("Success! package created.")
        },
        onError: (err) => {
            toast.error(err.message)
        }
    })

    const createPackage = async (e: React.FormEvent) => {
        try {

            e.preventDefault()

            const { perks, name, monthly_payment, duration, currency } = formData

            if (perks.length < 1) return toast.error("Put atlest 1 perks")
            if (!name) return toast.error("Name is required")
            if (!monthly_payment) return toast.error("Monthly payment is required")
            if (!duration) return toast.error("Duration is required")
            if (!currency) return toast.error("Currency is required")

            const data = {
                perks: JSON.stringify(perks),
                name,
                monthly_payment: Number(monthly_payment),
                duration: Number(duration),
                currency
            }

            await mutateAsync(data)

        } catch (error) {
            console.log(error);
            toast.error("Something went wrong")
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button>Create Package</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Create Package</AlertDialogTitle>
                </AlertDialogHeader>
                <form className='w-full flex flex-col gap-4' onSubmit={createPackage}>
                    <div className='flex items-center gap-5'>
                        <div className='w-full flex flex-col gap-1.5'>
                            <Label>Name</Label>
                            <Input required onChange={handleChange} value={formData.name} name="name" />
                        </div>
                        <div className='w-full flex flex-col gap-1.5'>
                            <Label>Duration (Years)</Label>
                            <Input required type='number' onChange={handleChange} value={formData.duration} name="duration" />
                        </div>
                    </div>
                    <div className='flex items-center gap-5'>
                        <div className='w-full flex flex-col gap-1.5'>
                            <Label>Monthly Payment</Label>
                            <Input required type='number' onChange={handleChange} value={formData.monthly_payment} name="monthly_payment" />
                        </div>
                        <div className='w-full flex flex-col gap-1.5'>
                            <Label>Currency</Label>
                            <Select required value={formData.currency} onValueChange={(val) => setFormData(prev => ({ ...prev, currency: val }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='PHP'>PHP</SelectItem>
                                    <SelectItem value='USD'>USD</SelectItem>
                                    <SelectItem value='EUR'>EUR</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                    </div>
                    <div className='relative py-5'>
                        <Separator />
                        <Label className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-5 bg-card lg:text-base">PERKS</Label>
                    </div>
                    <div className='flex items-center gap-5 pb-5'>
                        <Input value={perksInput} onChange={(e) => setPerksInput(e.target.value)} placeholder='Write down some perks...' />
                        <Button type='button' onClick={() => addPerks()}>Add Perks</Button>
                    </div>
                    <div className='flex flex-wrap w-full gap-3'>
                        {formData.perks.map((perks, i) => (
                            <div className='px-3 py-2 bg-secondary cursor-pointer flex items-start gap-2' key={i}>
                                <Label>
                                    {perks}
                                </Label>
                                <X size={16} className='text-primary' onClick={() => removePerks(perks)} />
                            </div>
                        ))}

                    </div>
                    <AlertDialogFooter className='flex items-center flex-row w-full gap-5'>
                        <Button
                            onClick={() => setOpen(false)}
                            variant={'secondary'}
                            className='w-full'
                            type='button'>Close</Button>
                        <Button className='w-full' disabled={isPending}>{isPending ? <LoaderCircle className='animate-spin' size={18} /> : "Create"}</Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default CreatePackage