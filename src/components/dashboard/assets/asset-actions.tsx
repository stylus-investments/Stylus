import React from 'react'
import SendToken from './send-token'
import ReceiveToken from './receive-token'
import Cashout from '../cashout/fundsOptions'
import Fee from './fee'

const AssetActions = () => {

    return (
        <div className='w-full flex items-center justify-between py-3 padding text-muted-foreground sm:justify-center sm:gap-16'>
            <SendToken />
            <ReceiveToken />
            <Cashout />
           <Fee />
        </div>
    )
}

export default AssetActions