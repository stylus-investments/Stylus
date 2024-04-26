import React from 'react'

import SnapshotHistory from './snapshot-history';

interface GrowRewardsProps {
    dashboardData: {
        snapshot_history: {
            snapshot: {
                start_date: string;
                end_date: string;
            };
            id: number;
            month: number;
            stake: string;
            reward: string;
            status: number;
        }[];
    }
}

const GrowRewards: React.FC<GrowRewardsProps> = ({ dashboardData }) => {

    return (
        <>
            <SnapshotHistory history={dashboardData.snapshot_history} />
        </>
    )
}

export default GrowRewards