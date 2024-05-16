import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'
import Image from 'next/image'

const Main = () => {
    return (
        <div className='flex flex-col md:flex-row gap-10 md:gap-20 items-center w-full text-center md:text-left h-screen justify-center md:pb-16 '>
            <div className='flex flex-col gap-5 w-full md:w-1/2 items-center  md:items-start'>
                <h1 className='font-thin text-6xl'>Making Growth Relevant</h1>
                <h2 className='text-sm text-muted-foreground md:text-base'>
                    Liquid stake your USDC through $GO
                    Earn yield up to 10 - 36 % anually
                    Be part of our dedicated community
                </h2>
                <Link href={'/connect'} className='w-52 pt-5'>
                    <Button className='w-full'>
                        Start Earning
                    </Button>
                </Link>
            </div>
            <div className='self-center md:w-1/4'>
                <Image src={'/go.webp'} alt='Go' width={140} height={30} className='h-auto rounded-full md:w-56' />
            </div>
        </div>
    )
}


export default Main