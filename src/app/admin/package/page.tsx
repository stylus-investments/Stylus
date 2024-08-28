import AdminHeader from '@/components/admin/admin-header'
import CreateOrUpdatePackage from '@/components/admin/package/create-or-update-package'
import PackageCard from '@/components/admin/package/package-card'
import { Label } from '@/components/ui/label'
import React from 'react'

const Page = () => {
    return (
        <>
            <AdminHeader />
            <div className='flex flex-col gap-10 pt-28 padding'>
                <div className='w-full border-b pb-2 flex items-center justify-between'>
                    <Label className='text-xl'>Package List</Label>
                    <CreateOrUpdatePackage type='Create' />
                </div>
                <PackageCard />
            </div>
        </>
    )
}

export default Page