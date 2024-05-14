import React from 'react'
import Image from 'next/image'
function Partners() {
    return (
        <div className='flex flex-col md:flex-row gap-10 md:gap-20 items- w-full text-center md:text-left md:h-screen justify-center md:pb-16 md:border-x'>
            <div className='flex flex-col gap-20 w-full md:w-1/2 items-center  md:items-start'>
                <h1 className='font-thin text-6xl md:text-7xl'>Making Finance Accessible</h1>
                <div className='flex items-center gap-8'>
                    <Image src={'/partners/coinbase.png'} alt='Coinbase' width={50} height={50} className='rounded-full' />
                    <div className='text-muted-foreground md:px-10'>Coinbase Wallet will be our primary wallet for mobile onboarding on web2 users.</div>
                </div>
                <div className='flex items-center gap-5'>
                    <Image src={'/partners/metamask.png'} alt='Metamask' width={50} height={50} className='rounded-full' />
                    <div className='text-muted-foreground md:px-10'>Metamask along with other wallets that supports BASE will still be supported.</div>
                </div>
            </div>
            <div className='md:w-1/4'>
                <Image src={'/dashboard.jpeg'} alt='Go' width={140} height={30} className='h-auto shadow-2xl rounded-lg w-full md:w-72' />
            </div>
        </div>
    )
}

export default Partners