import React from 'react'
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
const AssetsData = ({ assets }: {
  assets: {
    symbol: string;
    amount: string;
    name: string;
    price: string;
    value: string
    logo: string;
    change: string;
  }[]
}) => {


  const smallScreen = (
    <div className='flex flex-col w-full md:hidden'>
      {assets.map((asset, i) => (
        <div className='flex items-center justify-between p-3 border-b w-full' key={i}>
          <div className='flex iems-start gap-3'>
            <Image src={asset.logo} width={20} height={20} alt={asset.name} className='rounded-full max-h-[20px] max-w-[20px]' />
            <div className='flex flex-col gap-3'>
              <Label className='text-lg -mt-1.5'>{asset.symbol}</Label>
              <div className='text-muted-foreground text-xs -mt-2'>{asset.name}</div>
              <div className='text-xs'>
                24h change
              </div>
            </div>
          </div>
          <div className='flex flex-col gap-3 text-right'>
            <Label className='text-lg -mt-1.5'>{asset.amount}</Label>
            <div className='text-muted-foreground text-xs -mt-2'>${asset.value}</div>
            <div className='text-xs'>
              {asset.change}%
            </div>
          </div>
        </div>
      ))}
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
            <TableHead className='text-right'>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset, i) => (
            <TableRow key={i}>
              <TableCell className='flex gap-2 items-center'>
                <Image src={asset.logo} alt={asset.name} width={25} height={25} className='rounded-full' />
                <Label>{asset.symbol}</Label>
              </TableCell>
              <TableCell>
                ${asset.value}
              </TableCell>
              <TableCell>
                {asset.change}%
              </TableCell>
              <TableCell className='text-right'>
                {asset.amount}
              </TableCell>
            </TableRow>
          ))}
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