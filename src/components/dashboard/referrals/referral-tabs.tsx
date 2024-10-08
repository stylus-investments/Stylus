'use client'
import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ReferralsTable from './referrals-table'
import PayoutTables from './payout-tables'
import TopReferralsTable from './top-referrals-table'

const tabList = ['Rewards', 'Payouts', 'Leaderboard']

const ReferralTabs = ({ page }: {
  page: string | undefined
}) => {

  const [currentTab, setCurrentTab] = useState('rewards')

  return (
    <Tabs defaultValue="assets" value={currentTab} onValueChange={(val) => setCurrentTab(val)} className="w-full flex flex-col gap-5 items-center">
      <TabsList className='w-full lg:w-2/3 xl:w-1/2 self-start'>
        {tabList.map(tab => (
          <TabsTrigger className='w-full flex flex-col gap-1' value={tab.toLocaleLowerCase()} key={tab}>
            <div>{tab}</div>
            <div className={`h-0.5 w-4 ${currentTab === tab.toLocaleLowerCase() && "bg-primary"}`}></div>
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="rewards" className='w-full'>
        <ReferralsTable />
      </TabsContent>
      <TabsContent value="payouts" className='w-full'>
        <PayoutTables />
      </TabsContent>
      <TabsContent value="leaderboard" className='w-full'>
        <TopReferralsTable page={page} />
      </TabsContent>
    </Tabs>
  )
}

export default ReferralTabs