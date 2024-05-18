import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'
import { Label } from '../ui/label'

const Main = () => {
    return (
        <div className='flex flex-col gap-10 md:gap-12 items-center w-full text-center h-screen justify-center pt-10 md:pt-0 md:pb-16'>
            <div className='flex flex-col gap-5 sm:gap-6 md:gap-7 w-full items-center'>
                <div className='flex flex-col border-b pb-10 items-center gap-4'>
                    <Label className='text-lg'>Live on pre mainet phase</Label>
                    <p className='text-muted-foreground'>
                        We will be onboarding Web2 users through this amazing program, enabling them to experience DeFi in a tangible way with <span className='font-black text-foreground text-lg underline ml-2'>GrowPoint</span>
                    </p>
                </div>
                <h1 className='font-thin text-6xl md:text-7xl'>Making Growth Relevant</h1>
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
        </div>
    )
}


export default Main