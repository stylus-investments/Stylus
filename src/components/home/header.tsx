import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'
import { ToggleTheme } from '../ui/toggle-theme'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRocket } from '@fortawesome/free-solid-svg-icons'

const Header = () => {
  return (
    <div className='flex fixed top-0 left-0 w-screen h-16 backdrop-blur padding items-center justify-between border-b'>
      <Link href={'/'} className='flex items-center'>
        <Image src={'/logo.png'} alt='logo' width={48} height={20} className='w-auto h-auto' />
        <h1 className='hidden md:flex md:text-3xl font-black text-primary'>GrowPoint</h1>
      </Link>
      <div className='flex items-center gap-5'>
        <ToggleTheme />
        <Link href={'/connect'}>
          <Button variant={'ghost'}>
            <FontAwesomeIcon icon={faRocket} width={16} height={16} className='md:hidden' />
            <span className='hidden md:flex'>Launch App</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default Header