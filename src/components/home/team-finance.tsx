import React from 'react'
import Image from 'next/image'
const TeamFinance = () => {
  return (
    <div className='flex flex-col md:flex-row gap-10 items-center w-full text-center md:text-left md:justify-between py-20'>
      <div className='md:w-1/4 order-2 md:order-1'>
        <div className="relative mx-auto border-gray-900 dark:border-gray-900 bg-gray-900 border-[14px] rounded-[2.5rem] w-[300px] shadow-2xl" data-aos="zoom-out">
          <div className="h-[32px] w-[3px] bg-gray-900 dark:bg-gray-900 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
          <div className="h-[46px] w-[3px] bg-gray-900 dark:bg-gray-900 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
          <div className="h-[46px] w-[3px] bg-gray-900 dark:bg-gray-900 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
          <div className="h-[64px] w-[3px] bg-gray-900 dark:bg-gray-900 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
          <div className="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-primary dark:bg-card">
            <Image src={'/snapshot.jpeg'} alt='Go' width={140} height={30} className='h-auto shadow-2xl rounded-lg w-full' />
          </div>
        </div>
      </div>
      <div className='flex flex-col gap-12 w-full md:w-1/2 lg:w-2/3  items-center text-center order-1 md:order-2'>
        <h1 className='font-thin text-6xl' data-aos="fade-in">Making Innovation Works</h1>
        <Image src={'/partners/teamfinance.png'} alt='Go' width={140} height={30} className='h-auto' />
        <p className='text-muted-foreground' data-aos="fade-up">Capturing the innovation of Team Finance, security and peace of mind is maximized is called innovating on top of innovators.

        </p>
      </div>
    </div >
  )
}

export default TeamFinance