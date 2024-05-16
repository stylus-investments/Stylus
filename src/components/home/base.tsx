'use client'
import React from 'react'
import Image from 'next/image'
function Base() {
    return (
        <div className='flex flex-col md:flex-row gap-10 md:gap-20 py-20 items-center w-full text-center md:text-left justify-center md:pb-16'>
            <div className='md:w-1/4 order-2'>
                <div className="relative mx-auto border-gray-900 dark:border-gray-900 bg-gray-900 border-[14px] rounded-[2.5rem] w-[300px] shadow-2xl" data-aos="zoom-out-up">
                    <div className="h-[32px] w-[3px] bg-gray-900 dark:bg-gray-900 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
                    <div className="h-[46px] w-[3px] bg-gray-900 dark:bg-gray-900 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
                    <div className="h-[46px] w-[3px] bg-gray-900 dark:bg-gray-900 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
                    <div className="h-[64px] w-[3px] bg-gray-900 dark:bg-gray-900 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
                    <div className="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-primary dark:bg-card">
                        <Image src={'/snapshot.jpeg'} alt='Go' width={140} height={30} className='h-auto shadow-2xl rounded-lg w-full' />
                    </div>
                </div>            </div>
            <div className='flex flex-col gap-20 w-full md:w-1/2 items-center  md:items-start order-1'>
                <h1 className='font-thin text-6xl' data-aos="fade-in">Making Opportunities Infinite</h1>
                <div className='flex items-center w-full justify-around'>
                    <Image src={'/go.jpeg'} alt='Go' width={140} height={50} className='h-auto rounded-full' />
                    <Image src={'/partners/base.png'} alt='Go' width={140} height={50} className='h-auto rounded-full' />
                </div>
                <p className='text-muted-foreground' data-aos="fade-up">Building on Base, GrowPoint nurtures financial growth with boundless possibilities. Base provides the fertile soil from which our innovations bloom.
                </p>
            </div>
        </div>
    )
}

export default Base