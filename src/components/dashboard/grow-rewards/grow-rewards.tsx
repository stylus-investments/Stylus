import React from 'react'

import SnapshotHistory from './snapshot-history';

interface GrowRewardsProps {
    dashboardData: {
        wallet: string
    }
}

const GrowRewards: React.FC<GrowRewardsProps> = ({ dashboardData }) => {

    return (
        <>
            <SnapshotHistory wallet={dashboardData.wallet} />
        </>
    )
}

export default GrowRewards