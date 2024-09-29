'use client'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { faFlag, faCircleInfo, faUserEdit, faNotesMedical } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { trpc } from '@/app/_trpc/client'
import { Contact } from 'lucide-react'

const AccountStatus = () => {

    const { data: status } = trpc.dashboard.getUserAccountStatus.useQuery()
    if (!status) return null

    return (
        <div className='flex flex-col'>
            <div className='flex flex-col lg:flex-row w-full'>
                <div className='flex flex-col gap-3 p-5 border rounded-t-lg lg:rounded-bl-lg lg:rounded-br-none lg:rounded-tr-none w-full'>
                    <div className='text-muted-foreground flex items-center justify-between gap-3'>
                        <div className='flex items-center gap-3'>
                            <FontAwesomeIcon icon={faUserEdit} width={18} height={18} />
                            <Label>
                                Profile
                            </Label>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger disabled>
                                    <FontAwesomeIcon icon={faCircleInfo} width={16} height={16} className='hover:text-muted-foreground text-muted' />
                                </TooltipTrigger>
                                <TooltipContent>
                                    Your active stake in sBTC & sAVE tokens as recorded in the last snapshot.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className='w-full'>
                        <h1 className='font-black md:text-lg '>
                            {status.userStatus}
                        </h1>
                    </div>
                    <small className='text-muted-foreground'>Profile information</small>
                </div>
                <div className='flex flex-col gap-3 p-5 border w-full'>
                    <div className='text-muted-foreground flex items-center justify-between gap-3'>
                        <div className='flex items-center gap-3'>
                            <FontAwesomeIcon icon={faNotesMedical} width={18} height={18} />
                            <Label>
                                Insurance
                            </Label>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger disabled>
                                    <FontAwesomeIcon icon={faCircleInfo} width={16} height={16} className='hover:text-muted-foreground text-muted' />
                                </TooltipTrigger>
                                <TooltipContent>
                                    Your health insurance status details. Make sure all information is current to ensure proper benefits.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <h1 className='font-black md:text-lg'>
                        {status.hasInsurance ? "Active" : "Inactive"}
                    </h1>
                    <small className='text-muted-foreground'>Health Insurance</small>
                </div>
                <div className='flex flex-col gap-3 p-5 border w-full rounded-b-lg lg:rounded-bl-none lg:rounded-tr-lg'>
                    <div className='text-muted-foreground flex items-center justify-between gap-3'>
                        <div className='flex items-center gap-3'>
                            <Contact size={18} />
                            <Label>
                                Account
                            </Label>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger disabled>
                                    <FontAwesomeIcon icon={faCircleInfo} width={16} height={16} className='hover:text-muted-foreground text-muted' />
                                </TooltipTrigger>
                                <TooltipContent>
                                    Your account health indicates any unpaid orders. Please review your orders to maintain a good standing.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <h1 className='font-black md:text-lg'>
                        {status.hasUnpaidOrders ? "Overdue" : "On Time"}
                    </h1>
                    <small className='text-muted-foreground'>Account Health</small>
                </div>
            </div>
        </div>
    )
}

export default AccountStatus