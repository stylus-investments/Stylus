'use client'
/* eslint-disable @next/next/no-img-element */
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faTwitter } from '@fortawesome/free-brands-svg-icons'
import Link from 'next/link';
import { Label } from '../ui/label';
const Footer = () => {
    return (
        <footer className='padding w-full gap-5 flex flex-col items-center text-muted-foreground py-10 mt-20 border-t'>

            <div className='w-full flex flex-col gap-5 md:flex-row md:justify-between'>
                <div className='flex gap-4 items-center order-2 md:order-1 text-sm'>
                    © 2024, Savern
                    <Link href='#'>Terms</Link>
                    <Link href='#'>Privacy</Link>
                </div>
                <ul className='flex gap-4 items-center order-1 md:order-2'>
                    <Label >Join Us</Label>
                    <Link href={'https://twitter.com/growpointapp'} target='_blank'>
                        <FontAwesomeIcon icon={faTwitter} />
                    </Link>
                </ul>
                <ul className='flex flex-col md:flex-row md:items-center gap-4 order-3'>
                    <li className='flex items-center gap-3'>
                        <FontAwesomeIcon icon={faEnvelope} className='w-4' />
                        <p className='text-sm'>moore@savern.com</p>
                    </li>
                </ul>
            </div>
        </footer>
    );
}

export default Footer