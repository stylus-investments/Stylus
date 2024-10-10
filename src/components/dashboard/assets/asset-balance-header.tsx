'use client'
import React from 'react'
import { availableCurrencies } from '@/constant/availableCurrency'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useBalanceStore from '@/state/balanceStore'
import { Label } from '@/components/ui/label'
import { caller } from '@/app/_trpc/server'


const AssetBalancesHeader = ({ tokenData }: {
    tokenData: Awaited<ReturnType<typeof caller['dashboard']['getAssetData']>>
}) => {

    const { currency, showBalance } = useBalanceStore()

    return (
        <div className='flex flex-col items-start sm:items-center sm:text-center gap-3 pt-5'>
            <div className='flex items-center text-muted-foreground gap-3'>
                <Label className='font-normal'>
                    Your Balance
                </Label>
            </div>
            {tokenData.total_value_array.map((obj, i) => {
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
            })}
            <Label className='text-muted-foreground uppercase'>
                {tokenData.amount} {tokenData.symbol}
            </Label>
        </div>
    )
}

export default AssetBalancesHeader