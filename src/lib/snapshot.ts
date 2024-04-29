const returnSnapshotStatus = (status: number) => {
    if (status === 1) return 'Holding Period'
    if (status === 2) return 'Pending Reward'
    if (status === 3) return 'Rewarded'
    return 'Went below miniumum'
}

export { returnSnapshotStatus }