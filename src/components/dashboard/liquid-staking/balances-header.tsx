'use client'
import React from 'react'
import { availableCurrencies } from '@/constant/availableCurrency'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '../../ui/button'
import useBalanceStore from '@/state/balanceStore'
import { Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import CreateInvestment from '../investment-plan/create-investment'
import Link from 'next/link'
import { trpc } from '@/app/_trpc/client'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'


const BalancesHeader = () => {

    const { data } = trpc.dashboard.getWalletData.useQuery(undefined, {
        refetchOnMount: false,
        enabled: false
    })

    const userGasFee = trpc.user.checkGas.useQuery()
    const claimGass = trpc.user.claimGass.useMutation({
        onSuccess: () => {
            userGasFee.refetch()
            toast.success("Gas fee claimed successfully! You can now transfer your assets to your new wallet.");
        },
        onError: (err) => {
            toast.error(err.message)
        }
    })

    const { currency, showBalance, setShowBalance } = useBalanceStore()

    return (
        <div className='flex flex-col gap-5 lg:pt-10 padding'>
            <div className='flex flex-col items-center w-full gap-2'>
                {!userGasFee.data && !userGasFee.isPending && <div className='bg-muted p-5 rounded-md flex items-center flex-col text-center gap-1'>
                    <p>Claim your gas fee to cover the cost of transferring assets to your new wallet address.</p>
                    <button disabled={claimGass.isPending} onClick={() => claimGass.mutate()} className='mt-3 px-4 py-2 bg-primary text-white rounded-md'>
                        {claimGass.isPending ?
                            <LoaderCircle size={20} className='animate-spin' />
                            : "Claim Gas Fee"}
                    </button>
                </div>}
                <div className='flex items-center text-muted-foreground gap-3'>
                    <Label className='font-normal'>
                        Total Balance
                    </Label>
                    <div className='cursor-pointer' onClick={setShowBalance}>
                        {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
                    </div>
                </div>
                {
                    data?.balances.currentBalances ? data.balances.currentBalances.map((obj, i) => {
                        if (obj.currency === currency) {
                            // Find the matching currency object
                            const matchingCurrency = availableCurrencies.find(currency => currency.currency === obj.currency);
                            return (
                                <div className='font-medium text-4xl flex items-center justify-between' key={i}>
                                    {showBalance ? <div className='flex items-center'>
                                        {matchingCurrency && (
                                            <FontAwesomeIcon icon={matchingCurrency.icon} width={30} height={30} />
                                        )}
                                        <div>
                                            {(Number(obj.amount)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    </div> : <div>********</div>}
                                </div>
                            );
                        }
                    }) :
                        <Skeleton className='h-9 w-44' />
                }
            </div>
            <div className='flex items-center self-center w-full max-w-96 xl:w-80 sm:gap-5 gap-5'>
                <Link href={'/dashboard/wallet/plans'} className='w-full'>
                    <Button className='w-full'>
                        My Plan
                    </Button>
                </Link>
                <CreateInvestment />
            </div>
        </div >
    )
}

export default BalancesHeader