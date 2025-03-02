'use client'
import React from 'react'
import { availableCurrencies } from '@/constant/availableCurrency'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useBalanceStore from '@/state/balanceStore'
import { Label } from '@/components/ui/label'
import { trpc } from '@/app/_trpc/client'
import { Skeleton } from '@/components/ui/skeleton'
import { redirect, useSearchParams } from 'next/navigation'


const AssetBalancesHeader = ({ tokenAddress }: {
    tokenAddress: string
}) => {

    const searchParams = useSearchParams()
    const tokenName = searchParams.get("tokenName")
    const tokenSymbol = searchParams.get("tokenSymbol")
    const tokenLogo = searchParams.get("tokenLogo")

    if (!tokenName || !tokenSymbol || !tokenLogo) redirect('/dashboard/wallet')

    const { data, error } = trpc.dashboard.getAssetData.useQuery({
        tokenAddress,
        tokenLogo,
        tokenName,
        tokenSymbol
    })

    const { currency, showBalance } = useBalanceStore()

    return (
        <div className='flex flex-col items-start sm:items-center sm:text-center gap-3 pt-5'>
            <div className='flex items-center text-muted-foreground gap-3'>
                <Label className='font-normal'>
                    Your Balance
                </Label>
            </div>
            {data ? data.total_value_array.map((obj, i) => {
                if (obj.currency === currency) {
                    // Find the matching currency object
                    const matchingCurrency = availableCurrencies.find(currency => currency.currency === obj.currency);
                    return (
                        <div className='font-medium text-3xl flex items-center justify-between' key={i}>
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
                <Skeleton className='h-8 w-28' />
            }
            {data ? <Label className='text-muted-foreground uppercase'>
                {data.amount} {data.symbol}
            </Label>
                :
                <Skeleton className='h-7 w-44' />
            }
        </div>
    )
}

export default AssetBalancesHeader