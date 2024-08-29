'use client'
import React, { useState } from 'react'
import { availableCurrencies } from '@/constant/availableCurrency'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '../../ui/button'
import useBalanceStore from '@/state/balanceStore'
import { Eye, EyeOff } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import CreateInvestment from '../investment-plan/create-investment'


const BalancesHeader = ({ balances }: {
    balances: {
        currency: string;
        amount: string;
    }[] | undefined
}) => {

    const [showBalance, setShowBalance] = useState(true)

    const { currency } = useBalanceStore()

    return (
        <div className='flex flex-col gap-5 lg:pt-10 padding'>
            <div className='flex flex-col items-center w-full gap-2'>
                <div className='flex items-center text-muted-foreground gap-3'>
                    <Label className='font-normal'>
                        Total Balance
                    </Label>
                    <div className='cursor-pointer' onClick={() => setShowBalance(prev => !prev)}>
                        {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
                    </div>
                </div>
                {balances && balances.map((obj, i) => {
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
                })}
            </div>
            <div className='flex items-center self-center w-full xl:w-80 sm:gap-5 gap-5'>
                <CreateInvestment />
                <Button className='w-full' variant={'secondary'} onClick={() => toast("Working pako ani sir hehehe")}>
                    Pay
                </Button>
            </div>
        </div >
    )
}

export default BalancesHeader