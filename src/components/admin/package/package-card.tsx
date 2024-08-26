'use client'
import { trpc } from '@/app/_trpc/client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

const PackageCard = () => {

    const { data } = trpc.package.getAllPackages.useQuery()

    return (

        <div className='flex w-full flex-wrap'>
            {data ? data.map(obj => (
                <Card className='max-w-[400px] w-full' key={obj.id}>
                    <CardHeader>
                        <CardTitle>{obj.name}</CardTitle>
                    </CardHeader>
                </Card>
            )) : ""}
        </div>
    )
}

export default PackageCard