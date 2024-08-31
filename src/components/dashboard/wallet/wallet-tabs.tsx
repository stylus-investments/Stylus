'use client'
import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GuideAccordions from '../liquid-staking/guide-accordions'
import SnapshotHistory from '../grow-rewards/snapshot-history'
import AssetsData from './assets-data'

const tabList = ['Assets', 'Snapshots', 'Guides']

const WalletTabs = ({ assets }: {
    assets: {
        symbol: string;
        amount: string;
        name: string;
        price: string;
        logo: string;
        value: string
        change: string;
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
                <AssetsData assets={assets} />
            </TabsContent>
            <TabsContent value="snapshots" className='w-full'>
                <SnapshotHistory />
            </TabsContent>
            <TabsContent value="guides" className='w-full'>
                <GuideAccordions />
            </TabsContent>
        </Tabs>
    )
}

export default WalletTabs