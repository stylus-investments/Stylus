import React from 'react'
import { Separator } from '@/components/ui/separator'
import StakingData from '../liquid-staking/staking-data'
import { Label } from '@/components/ui/label'
import SnapshotHistory from '../grow-rewards/snapshot-history'
import AccountStatus from '../account-status'
import LabelSeparator from '@/components/ui/label-separator'
const StatusData = () => {
    return (
        <div className='flex flex-col gap-10'>
            <LabelSeparator text='ACCOUNT STATUS' />
            <AccountStatus />
            <SnapshotHistory />
            <LabelSeparator text='LIQUID STAKING' />

        
            <StakingData />
        </div>
    )
}

export default StatusData