import React from 'react'
import { Separator } from '@/components/ui/separator'
import StakingData from '../liquid-staking/staking-data'
import { Label } from '@/components/ui/label'
import SnapshotHistory from '../grow-rewards/snapshot-history'
import AccountStatus from '../account-status'
const StatusData = () => {
    return (
        <div className='flex flex-col gap-10'>
            <div className='relative py-5'>
                <Separator />
                <Label className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-5 bg-card lg:text-base">ACCOUNT STATUS</Label>
            </div>
            <AccountStatus />
            <SnapshotHistory />
            <div className='relative py-5'>
                <Separator />
                <Label className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-5 bg-card lg:text-base">LIQUID STAKING</Label>
            </div>
            <StakingData />
        </div>
    )
}

export default StatusData