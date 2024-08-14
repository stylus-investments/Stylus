'use client'
import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GuideAccordions from '../liquid-staking/guide-accordions'
import OrderHistory from '../liquid-staking/order-history'
import SnapshotHistory from '../grow-rewards/snapshot-history'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Image from 'next/image'

const tabList = ['Assets', 'Snapshots', 'Orders', 'Guides']

const WalletTabs = ({ tokens }: {
    tokens: {
        name: string
        amount: string
        icon: string
    }[]
}) => {

    const [currentTab, setCurrentTab] = useState('assets')

    return (
        <Tabs defaultValue="assets" value={currentTab} onValueChange={(val) => setCurrentTab(val)} className="w-full flex flex-col gap-5 items-center padding">
            <TabsList className='bg-card w-full lg:w-2/3 xl:w-1/2'>
                {tabList.map(tab => (
                    <TabsTrigger className='w-full flex flex-col gap-1' value={tab.toLocaleLowerCase()} key={tab}>
                        <div>{tab}</div>
                        <div className={`h-0.5 w-4 ${currentTab === tab.toLocaleLowerCase() && "bg-primary"}`}></div>
                    </TabsTrigger>
                ))}
            </TabsList>
            <TabsContent value="assets" className='w-full'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className='text-right'>Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tokens.map((token, i) => (
                            <TableRow key={i}>
                                <TableCell className='flex items-center gap-2'>
                                    <Image src={token.icon} width={20} height={20} alt='Token Icon' className='rounded-full' />
                                    {token.name}
                                </TableCell>
                                <TableCell className='text-right'>{token.amount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TabsContent>
            <TabsContent value="snapshots" className='w-full'>
                <SnapshotHistory />
            </TabsContent>
            <TabsContent value="orders" className='w-full'>
                <OrderHistory />
            </TabsContent>
            <TabsContent value="guides" className='w-full'>
                <GuideAccordions />
            </TabsContent>
        </Tabs>
    )
}

export default WalletTabs