'use client'
import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Rocket } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'
const Main = () => {

    return (
        <main className='pt-32 lg:h-screen pb-20 relative md:pb-32 lg:pt-40 lg:items-start xl:h-screen xl:justify-center padding lg:flex-row lg:justify-between w-full flex flex-col md:items-center xl:pt-28 gap-10 md:gap-16 dark:bg-[radial-gradient(ellipse_70%_80%_at_bottom_center,#0f1440,#000_100%)]
        bg-[radial-gradient(ellipse_70%_80%_at_bottom_center,#566bf5,#fff_100%)]
        '>
            <div className='flex flex-col md:items-center gap-3 items-start md:text-center lg:text-left lg:items-start md:gap-4 w-full lg:w-[500px] xl:w-[600px]'>
                <h2 className='text-foreground px-5 shadow-lg border py-2 tracking-tight text-center rounded-lg'>Live on pre mainet phase
                </h2>
                <h1 className='font-black tracking-tighter text-5xl py-0.5 bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text'>Making Growth Relevant
                </h1>
                <p className='text-xl tracking-tight'>
                    We will be onboarding Web2 users through this amazing program, enabling them to experience DeFi in a tangible way with <span className='font-black text-foreground text-lg underline ml-2'>Savern</span>
                </p>
                <div className='flex w-full items-center pt-5 gap-3 md:w-2/3'>
                    <Link href={`/connect`} className='w-full'>
                        <Button className='w-full font-bold'>
                            Launch App
                            <Rocket size={18} />
                        </Button>
                    </Link>
                    <Link href={`/connect`} className='w-full'>
                        <Button className='w-full font-bold shadow-md border' variant={'ghost'}>
                            Get Started
                        </Button>
                    </Link>
                </div>
            </div>
            <div className='md:flex-1 w-full h-[300px] lg:max-w-[250px] flex items-center justify-center xl:bg-transparent rounded-3xl relative'>
                <motion.img src={'/partners/base.png'}
                    alt='ImageEdits main image' width={300} height={150}
                    className='cursor-pointer h-auto w-[170px] bg-cover hover:shadow-2xl hover:shadow-blue-800 rounded-full'

                    animate={{
                        translateY: [-5, 5],
                    }}
                    transition={{
                        repeat: Infinity,
                        repeatType: 'mirror',
                        duration: 2,
                        ease: "easeInOut"
                    }}
                />
                <motion.img src={'/icons/logo/logo.svg'}
                    alt='ImageEdits main image' width={80} height={80}
                    className='cursor-pointer absolute h-auto w-[80px] bg-cover hover:shadow-2xl hover:shadow-primary right-3 bottom-3 md:-bottom-12 md:right-24 rounded-full'

                    animate={{
                        translateY: [5, -5],
                        translateX: [-5, 5],
                    }}
                    transition={{
                        repeat: Infinity,
                        repeatType: 'mirror',
                        duration: 3,
                        ease: "easeInOut"
                    }}
                />
                <motion.img src={'/icons/token/save.svg'}
                    alt='ImageEdits main image' width={80} height={80}
                    className='cursor-pointer absolute h-auto w-[80px] bg-cover hover:shadow-2xl hover:shadow-primary right-3 top-3 md:-top-6 md:right-16 rounded-full'

                    animate={{
                        translateY: [-5, 5],
                        translateX: [-5, 5],
                    }}
                    transition={{
                        repeat: Infinity,
                        repeatType: 'mirror',
                        duration: 3,
                        ease: "easeInOut"
                    }}
                />
                <motion.img src={'/icons/token/sphp.svg'}
                    alt='ImageEdits main image' width={80} height={80}
                    className='cursor-pointer absolute h-auto w-[80px] bg-cover hover:shadow-2xl hover:shadow-primary left-3 bottom-3 md:-bottom-12 md:left-24 rounded-full'

                    animate={{
                        translateY: [-5, 5],
                        translateX: [-5, 5],

                    }}
                    transition={{
                        repeat: Infinity,
                        repeatType: 'mirror',
                        duration: 2,
                        ease: "easeInOut"
                    }}
                />
                <motion.img src={'/icons/token/sbtc.svg'}
                    alt='ImageEdits main image' width={80} height={80}
                    className='cursor-pointer absolute h-auto w-[80px] bg-cover hover:shadow-2xl hover:shadow-primary left-3 top-3 md:-top-6 md:left-16 rounded-full'

                    animate={{
                        translateY: [-5, 5],
                        translateX: [5, -5],
                    }}
                    transition={{
                        repeat: Infinity,
                        repeatType: 'mirror',
                        duration: 4,
                        ease: "easeInOut"
                    }}
                />
            </div>
            <div className='hidden lg:block absolute bottom-40 w-[700px] left-1/2 transform -translate-x-1/2'>
                <div className='flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)]'>
                    <motion.div className='gap-5 pr-5 flex flex-none' animate={{
                        translateX: "-50%"
                    }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: 'linear',
                            repeatType: "loop"
                        }}
                    >
                        {Array.from({ length: 5 }, (_, index) => index + 1).map(i => (
                            <Image width={120} height={100} className='h-14 w-[150px] object-contain' quality={100} src={`/partners/${i}.png`} alt='Partner Logo' key={i} />
                        ))}
                        {Array.from({ length: 5 }, (_, index) => index + 1).map(i => (
                            <Image width={120} height={100} className='h-14 w-[150px] object-contain' quality={100} src={`/partners/${i}.png`} alt='Partner Logo' key={i} />
                        ))}
                    </motion.div>
                </div>
            </div>
        </main>
    )

    return (
        <div className='flex flex-col gap-10 md:gap-12 items-center w-full text-center h-screen justify-center pt-10 md:pt-0 md:pb-16 padding'>
            <div className='flex flex-col gap-5 sm:gap-6 md:gap-7 w-full items-center'>
                <div className='flex flex-col border-b pb-10 items-center gap-4'>
                    <Label className='text-lg'>Live on pre mainet phase</Label>
                    <p className='text-muted-foreground'>
                        We will be onboarding Web2 users through this amazing program, enabling them to experience DeFi in a tangible way with <span className='font-black text-foreground text-lg underline ml-2'>Savern</span>
                    </p>
                </div>
                <h1 className='font-thin text-6xl md:text-7xl'>Making Growth Relevant</h1>
                <h2 className='text-sm text-muted-foreground md:text-base'>
                    Liquid stake your USDC through SAVE
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