import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'
import { ToggleTheme } from '../ui/toggle-theme'

const Header = () => {
  return (
    <div className='flex fixed top-0 left-0 w-screen h-16 backdrop-blur padding items-center justify-between border-b'>
      <div className='flex items-center gap-4'>
        <Image src={'/logo.png'} alt='logo' width={50} height={20} className='w-auto h-auto' />
        <h1 className='text-3xl font-black text-primary'>GrowPoint</h1>
      </div>
      <div className='flex items-center gap-5'>
        <ToggleTheme />
        <Link href={'/app'}>
          <Button>
            Launch App
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default Header