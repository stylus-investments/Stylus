'use client'
import { trpc } from '@/app/_trpc/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { CircleCheckBig, LoaderCircle } from 'lucide-react'
import React from 'react'
import CreateOrUpdatePackage from './create-or-update-package'

const PackageCard = () => {

    const { data, isLoading, isError } = trpc.package.getAllPackages.useQuery('ADMIN')

    if (isLoading) return (
        <div className='h-96 w-full flex items-center justify-center'>
            <LoaderCircle size={50} className='animate-spin' />
        </div>
    )
    if (isError) return (
        <div className='h-96 w-full flex items-center justify-center'>
            <LoaderCircle size={50} className='animate-spin' />
        </div>
    )

    return (

        <div className='flex w-full gap-8 flex-wrap justify-center'>
            {data && data.length > 0 ? data.map(obj => (
                <Card className='max-w-[450px] w-full h-full' key={obj.id}>
                    <CardHeader>
                        <CardTitle className='flex items-center justify-between'>
                            <h1>{obj.name}</h1>
                            <CreateOrUpdatePackage type='Update' pckg={obj} />
                        </CardTitle>
                        <CardDescription className='flex items-center gap-3 flex-wrap pt-2'>PRICES:{
                            obj.prices.map((price, i) => (
                                <span key={i} className='px-3 rounded-md py-1 bg-muted text-foreground'>{price}</span>
                            ))}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='flex flex-col gap-5 h-full'>
                        <div className='flex flex-col gap-2'>
                            <Label className='text-base'>Benefits</Label>
                            {obj.perks.map((perk, i) => (
                                <div className='flex items-center gap-3' key={perk}>
                                    <CircleCheckBig size={15} />
                                    <small className='text-muted-foreground'>{perk}</small>
                                </div>
                            ))
                            }
                        </div>
                        <div className='flex flex-col gap-2 justify-self-end'>
                            <Separator />
                            <div className='w-full flex items-center justify-between'>
                                <small>Duration:{obj.duration} Years</small>
                                <small>Cycle: {obj.billing_cycle}</small>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )) : <div className='h-96 w-full flex items-center justify-center text-lg'>No Package.</div>}
        </div >
    )
}

export default PackageCard