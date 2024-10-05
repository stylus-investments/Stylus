'use client'
import React from 'react'
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { caller } from '@/app/_trpc/server';
import useBalanceStore from '@/state/balanceStore';
import { availableCurrencies } from '@/constant/availableCurrency';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const AssetsData = ({ assets }: {
  assets: Awaited<ReturnType<typeof caller['dashboard']['getWalletData']>>['balances']['assets']
}) => {

  const { currency, showBalance } = useBalanceStore()


  const returnAssetIcon = (symbol: string | undefined) => {

    switch (symbol) {
      case 'sPHP':
        return '/icons/token/sphp.svg'
      case 'sBTC':
        return '/icons/token/sbtc.svg'
      case 'sAVE':
        return '/icons/token/save.svg'
      case 'USDC':
        return '/icons/token/usdc.png'
    }
    return '/icons/logo/logo.svg'
  }

  const smallScreen = (
    <div className='flex flex-col w-full md:hidden'>
      {assets.length > 0 ? assets.map((asset, i) => (
        <div className='flex items-center justify-between px-3 py-4 border-b w-full' key={i}>
          <div className='flex iems-start gap-2.5'>
            <Image src={returnAssetIcon(asset?.symbol)} width={20} height={20} alt={asset?.name || ""} className='rounded-full max-h-[20px] max-w-[20px]' />
            <div className='flex flex-col gap-3'>
              <Label className='text-lg -mt-1.5'>{asset?.symbol}</Label>
              <div className='text-muted-foreground text-xs -mt-2'>{asset?.name}</div>
              <div className='text-xs text-muted-foreground'>
                24h change
              </div>
              <div className='text-xs'>
                Total Value
              </div>
            </div>
          </div>
          <div className='flex flex-col gap-2.5 text-right'>
            <Label className='text-base -mt-1.5'>
              {!showBalance ? "******" :
                asset?.amount ? Number(asset?.amount).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }) : ''
              }
            </Label>
            <div className='text-muted-foreground text-xs -mt-2'>
              {asset?.value_array.map((obj, i) => {
                if (obj.currency === currency) {
                  // Find the matching currency object
                  const matchingCurrency = availableCurrencies.find(currency => currency.currency === obj.currency);
                  if (!showBalance) return "******"
                  return (
                    <div className='flex items-center w-full justify-end' key={i}>
                      {matchingCurrency && (
                        <FontAwesomeIcon icon={matchingCurrency.icon} width={15} height={15} />
                      )}
                      <div>
                        {(Number(obj.amount)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 })}
                      </div>
                    </div>
                  );
                }
              })}
            </div>
            <div className={`text-xs ${Number(asset?.change) > 0 ? "text-green-500" : "text-red-500"}`}>
              {Number(asset?.change) > 0 ? "+" : ""}{asset?.change}%
            </div>
            <div className='text-md'>
              {asset?.total_value_array.map((obj, i) => {
                if (obj.currency === currency) {
                  // Find the matching currency object
                  const matchingCurrency = availableCurrencies.find(currency => currency.currency === obj.currency);
                  if (!showBalance) return "********"
                  return (
                    <div className='flex items-center w-full' key={i}>
                      {matchingCurrency && (
                        <FontAwesomeIcon icon={matchingCurrency.icon} width={15} height={15} />
                      )}
                      <div>
                        {(Number(obj.amount)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 })}
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>
      )) :
        <div className='flex justify-center pt-20'>No Data.</div>
      }
    </div>
  )

  const largeScreen = (
    <div className='hidden md:block'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>24h Change</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Total Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.length > 0 ? assets.map((asset, i) => (
            <TableRow key={i}>
              <TableCell className='flex gap-2 items-center'>
                <Image src={returnAssetIcon(asset?.symbol)} alt={asset?.name || ""} width={25} height={25} className='rounded-full' />
                <Label>{asset?.symbol}</Label>
              </TableCell>
              <TableCell>
                {asset?.value_array.map((obj, i) => {
                  if (obj.currency === currency) {
                    // Find the matching currency object
                    const matchingCurrency = availableCurrencies.find(currency => currency.currency === obj.currency);
                    if (!showBalance) return "********"

                    return (
                      <div className='flex items-center' key={i}>
                        {matchingCurrency && (
                          <FontAwesomeIcon icon={matchingCurrency.icon} width={15} height={15} />
                        )}
                        <div>
                          {(Number(obj.amount)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 })}
                        </div>
                      </div>
                    );
                  }
                })}
              </TableCell>
              <TableCell className={`${Number(asset?.change) > 0 ? "text-green-500" : "text-red-500"}`}>
                {Number(asset?.change) > 0 ? "+" : ""}{asset?.change}%
              </TableCell>
              <TableCell>
                {!showBalance ? "********" :
                  asset?.amount ? Number(asset?.amount).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }) : ''
                }
              </TableCell>
              <TableCell>
                {asset?.total_value_array.map((obj, i) => {
                  if (obj.currency === currency) {
                    // Find the matching currency object
                    const matchingCurrency = availableCurrencies.find(currency => currency.currency === obj.currency);
                    if (!showBalance) return "********"

                    return (
                      <div className='flex items-center w-full' key={i}>
                        {matchingCurrency && (
                          <FontAwesomeIcon icon={matchingCurrency.icon} width={15} height={15} />
                        )}
                        <div>
                          {(Number(obj.amount)).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 })}
                        </div>
                      </div>
                    );
                  }
                })}
              </TableCell>
            </TableRow>
          )) :
            <TableRow>
              <TableCell>No Data</TableCell>
            </TableRow>
          }
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className='w-full'>
      {smallScreen}
      {largeScreen}
    </div>
  )
}

export default AssetsData