'use client'
import React from 'react'
import Image from 'next/image'
function Graphene() {
    return (
        <div className='flex flex-col md:flex-row gap-10 md:gap-20 py-20 w-full text-center md:text-left justify-center md:pb-16 md:border-x'>
            <div className='md:w-1/4 order-2 md:order-1'>
                <Image src={'/buygo.jpeg'} alt='Go' width={140} height={30} className='h-auto shadow-2xl rounded-lg w-full md:w-72' />
            </div>
            <div className='flex flex-col gap-20 w-full md:w-1/2 items-center  md:items-start order-1 md:order-2'>
                <h1 className='font-thin text-6xl md:text-7xl'>Making Defi Real</h1>
                <p className='text-muted-foreground'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam nostrum atque sequi inventore hic vero modi! Repellendus similique hic inventore molestiae commodi facere, voluptate adipisci ut mollitia unde non soluta.</p>
                <Image src={'/partners/graphene.png'} alt='Graphene' width={140} height={50} className='w-1/2 mt-auto' />
            </div>
        </div>
    )
}

export default Graphene