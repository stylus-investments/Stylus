'use client'
import { trpc } from '@/app/_trpc/client'
import DashboardHeader from '@/components/dashboard/dashboard-header'
import DashboardLinksFooter from '@/components/dashboard/dashboard-links-footer'
import BalancesHeader from '@/components/dashboard/liquid-staking/balances-header'
import StakingData from '@/components/dashboard/liquid-staking/staking-data'
import WalletTabs from '@/components/dashboard/wallet/wallet-tabs'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { usePrivy } from '@privy-io/react-auth'
import { Loader } from 'lucide-react'
import { redirect } from 'next/navigation'
import React from 'react'

const WalletPage = () => {

    const { user, ready, authenticated } = usePrivy()

    if (!ready) return <div className='h-screen grid place-items-center'>
        <Loader size={50} className='animate-spin text-primary' />
    </div>

    if (ready && !authenticated) redirect('/connect')

    if (ready && user && user?.wallet) {

        const { data } = trpc.dashboard.getWalletData.useQuery({ wallet_address: user.wallet.address })

        if (!data) return <div className='h-screen grid place-items-center'>
            <Loader size={50} className='animate-spin text-primary' />
        </div>

        return (
            <div className='flex flex-col gap-5 w-full py-24'>
                <DashboardHeader currentPage='wallet' />
                <DashboardLinksFooter currentPage='wallet' />
                <BalancesHeader balances={data.balances.currentBalances} />
                <WalletTabs
                 assets={data.balances.assets}
                />
                <div className='relative padding py-5'>
                    <Separator />
                    <Label className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-5 bg-card lg:text-base">LIQUID STAKING</Label>
                </div>
                <StakingData snapshot={data.snapshot} saveBalance={data?.balances.current_save_balance} />
            </div>
        )
    }

}

export default WalletPage