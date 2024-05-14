'use client'
import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import Autoplay from "embla-carousel-autoplay"
import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import Image from 'next/image'

const Main = () => {
    return (
        <div className='md:container px-5 flex flex-col gap-10 pt-32 items-center text-center md:border-x'>
            <div className='flex flex-col gap-3 border-b pb-5'>
                <Label className='text-xl'>Live on pre mainet phase</Label>
                <div className='text-muted-foreground text-sm md:text-base'>
                    We will be onboarding Web2 users through this amazing program,
                    enabling them to experience DeFi in a tangible way with GrowPoint.
                </div>
            </div>
            <div className='flex flex-col gap-4 border-b pb-10'>
                <h1 className='font-thin text-6xl lg:text-7xl'>Making. Defi. Relevant.</h1>
                <h2 className='text-sm text-muted-foreground md:text-base px-10'>
                    Liquid stake your USDC through $GO
                    Earn yield up to 10 - 36 % anually
                    Be part of our dedicated community
                </h2>
                <Link href={'/connect'} className='w-52 self-center pt-5'>
                    <Button className='w-full'>
                        Launch App
                    </Button>
                </Link>
            </div>
            <Partners />
        </div>
    )
}

export function Partners() {
    const plugin = React.useRef(
        Autoplay({ delay: 2000 }))
    return (
        <div className='flex flex-col gap-4'>
            <Label className='text-xl'>Partners in Integration and Growth</Label>
            <Carousel
                plugins={[plugin.current]}
                className="w-full md:hidden"
            >
                <CarouselContent className='flex items-center'>
                    {Array.from({ length: 10 }).map((_, index) => (
                        <CarouselItem key={index} className='basis-1/5 sm:basis-1/6'>
                            <Image src={'/partners/base.png'} alt='Partners' width={40} height={40} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
            <div className='items-center gap-5 hidden md:flex'>
                {Array.from({
                    length: 10
                }).map((_, index) => (
                    <Link key={index} href={'#'}>
                        <Image
                            alt="Partners"
                            src={'/partners/base.png'}
                            width={35} height={35}
                            className='rounded-full' />
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default Main