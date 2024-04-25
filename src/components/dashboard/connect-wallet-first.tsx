import React from 'react'
import ConnectWalletButton from './connect-wallet-button'

const ConnectWalletFirst = () => {
    return (
        <main className='container flex flex-col items-center py-40 gap-10'>
            <h1 className='text-2xl font-black flex flex-col gap-5'>
                Connect Your Wallet First.
                <ConnectWalletButton />
            </h1>
        </main>
    )
}

export default ConnectWalletFirst