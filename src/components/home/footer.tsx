'use client'
/* eslint-disable @next/next/no-img-element */
import React from 'react'
import Image from 'next/image';
import { footerTexts } from '@/constant/footerTexts';
import { Link as ScrollLink } from 'react-scroll'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import { faFacebook } from '@fortawesome/free-brands-svg-icons'
import Link from 'next/link';
import { Label } from '../ui/label';
const Footer = () => {
    return (
        <footer className='md:px-0 gap-5 flex flex-col items-center text-muted-foreground py-10'>

            <nav className='flex md:justify-between flex-col gap-7 lg:gap-0 md:flex-row w-full'>
                <div className='flex flex-col gap-4 md:w-1/3 lg:w-1/4'>
                    <Image src={'/logo.png'} alt='Logo' width={90} height={10} className='h-auto' />
                    <p className='text-sm leading-6'>{footerTexts.description}</p>
                    <ScrollLink to='about' duration={2000} smooth={true} href='#about' className='font-medium text-primary cursor-pointer'>Team</ScrollLink>
                </div>
                <ul className='flex flex-col gap-4'>
                    <Label className='md:mb-2 text-primary text-lg'>Contact</Label>
                    <li className='flex gap-4'>
                        <FontAwesomeIcon icon={faPhone} className='w-4' />
                        <p className='text-sm'>+63 123 456 789 0</p>
                    </li>
                    <li className='flex items-center gap-4'>
                        <FontAwesomeIcon icon={faEnvelope} className='w-4' />
                        <p className='text-sm'>support@growpoint.app</p>
                    </li>
                </ul>

                <ul className='flex items-center gap-4 md:gap-3 md:flex-col md:items-start'>
                    <Label className='md:mb-2 text-primary text-lg'>Company</Label>
                    <li>
                        <ScrollLink to='about' duration={2000} smooth={true} href='#about' className='text-sm hover:text-primary cursor-pointer' >About</ScrollLink>
                    </li>
                    <li>
                        <ScrollLink to='contact' duration={2000} smooth={true} href='#contact' className='text-sm lg:text-base hover:text-primary cursor-pointer' >Contact</ScrollLink>
                    </li>
                    <li>
                        <Link href={'/faq'} className='text-sm lg:text-base hover:text-primary-600' >FAQ</Link>
                    </li>
                </ul>

            </nav>
            <div className='pt-10 w-full border-t flex flex-col gap-5 md:flex-row md:justify-between'>
                <div className='flex gap-4 items-center order-2 md:order-1 text-sm'>
                    © 2024, GrowPoint
                    <Link href='/license'>License</Link>
                    <Link href='/terms'>Terms</Link>
                    <Link href='/privacy'>Privacy</Link>
                </div>
                <ul className='flex gap-5 items-center order-1 md:order-2'>
                    <Label >Join Us</Label>
                    <Link href={'#'} target='_blank'>
                        <FontAwesomeIcon icon={faFacebook} />
                    </Link>
                    <Link href={'#'} target='_blank'>
                        <FontAwesomeIcon icon={faFacebook} />
                    </Link>
                    <Link href={'#'} target='_blank'>
                        <FontAwesomeIcon icon={faFacebook} />
                    </Link>
                </ul>
            </div>
        </footer>
    );
}

export default Footer