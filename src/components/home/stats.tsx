import React from 'react'
import Image from 'next/image'
const Stats = () => {
    return (
        <div className='flex flex-col padding md:flex-row gap-10 items-center w-full text-center md:text-left lg:justify-center py-20 lg:h-screen'>
            <div className='flex flex-col gap-12 w-full md:w-1/2 lg:w-2/3 items-center  md:items-start'>
                <h1 className='font-thin text-6xl' data-aos="fade-in">Making Finance Accessible</h1>
                <div className='flex items-center gap-3'>
                    <Image data-aos="fade-right" src={'/partners/coinbase.png'} alt='Coinbase' width={50} height={50} className='rounded-full' />
                    <div data-aos="fade-up" className='text-muted-foreground md:px-10'>Coinbase Wallet will be our primary wallet for mobile onboarding on web2 users.</div>
                </div>
                <div className='flex items-center gap-3'>
                    <Image data-aos="fade-right" src={'/partners/metamask.png'} alt='Metamask' width={50} height={50} className='rounded-full' />
                    <div data-aos="fade-up" className='text-muted-foreground md:px-10'>Metamask along with other wallets that supports BASE will still be supported.</div>
                </div>
            </div>
            <div className='md:w-1/4'>
                <div className="relative mx-auto border-gray-900 dark:border-gray-900 bg-gray-900 border-[14px] rounded-[2.5rem] w-[300px] shadow-2xl" data-aos="flip-left" >
                    <div className="h-[32px] w-[3px] bg-gray-900 dark:bg-gray-900 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
                    <div className="h-[46px] w-[3px] bg-gray-900 dark:bg-gray-900 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
                    <div className="h-[46px] w-[3px] bg-gray-900 dark:bg-gray-900 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
                    <div className="h-[64px] w-[3px] bg-gray-900 dark:bg-gray-900 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
                    <div className="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-primary dark:bg-card">
                        <Image src={'/dashboard.jpeg'} alt='Go' width={140} height={30} className='h-auto shadow-2xl rounded-lg w-full' />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Stats