// 'use client'
// import { Label } from '@/components/ui/label'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { Separator } from '@/components/ui/separator'
// import React, { useState } from 'react'
// import BalanceHistory from '../liquid-staking/balance-history'
// import OrderHistory from '../liquid-staking/order-history'

// const WalletTable = () => {
//     const [balanceTable, setBalanceTable] = useState('2')

//     return (
//         <div className='flex flex-col gap-5 padding'>
//             <div className='flex items-center gap-3'>
//                 <Label>Show Table</Label>
//                 <Separator orientation='vertical' className='h-7' />
//                 <Select value={balanceTable} onValueChange={(value) => setBalanceTable(value)} >
//                     <SelectTrigger className='w-44'>
//                         <SelectValue placeholder={balanceTable === '1' ? 'Balance History' : 'Order History'} />
//                     </SelectTrigger>
//                     <SelectContent>
//                         <SelectItem value="1">Save History</SelectItem>
//                         <SelectItem value="2">Order History</SelectItem>
//                     </SelectContent>
//                 </Select>
//             </div>
//             {balanceTable === '1' ?
//                 <BalanceHistory /> :
//             }
//         </div>
//     )
// }

// export default WalletTable


const WalletTable = () => {

}

export default WalletTable