'use client'
import { dashboardLinks } from '@/constant/dashboardLinks'
import Link from 'next/link'
import React from 'react'

const DashboardLinksHeader = ({ currentPage }: { currentPage: string }) => {

    return (
        <>
            <ul className='hidden lg:flex items-center gap-2 text-sm mx-auto text-muted-foreground'>
                {dashboardLinks.map((link, i) => (
                    <Link href={link.link} className={`${currentPage === link.label.toLocaleLowerCase() && "text-foreground font-bold"} px-4 py-2`} key={i}>{link.label}</Link>
                ))}
            </ul>
        </>
    )
}

export default DashboardLinksHeader