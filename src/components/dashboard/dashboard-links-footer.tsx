import { dashboardLinks } from '@/constant/dashboardLinks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import React from 'react'
import { Label } from '../ui/label'

const DashboardLinksFooter = ({ currentPage }: { currentPage: string }) => {

    return (
        <div className='lg:hidden fixed z-50 w-screen right-0 padding border-t h-16 bottom-0 bg-card'>
            <div className='flex items-center w-full text-muted-foreground h-full'>
                {dashboardLinks.map((link, i) => (
                    <Link href={link.link} key={i} className={`flex flex-col items-center cursor-pointer ${currentPage === link.label.toLocaleLowerCase() && "text-primary"} p-1 justify-center rounded-md w-full`}>
                        <FontAwesomeIcon icon={link.icon} width={18} height={18} className='text-lg p-1' />
                        <Label className='font-normal text-xs cursor-pointer'>{link.label}</Label>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default DashboardLinksFooter