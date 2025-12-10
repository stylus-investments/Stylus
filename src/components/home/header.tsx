import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'
import { ToggleTheme } from '../ui/toggle-theme'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRocket } from '@fortawesome/free-solid-svg-icons'

const Header = () => {
  return (
    <div className='flex top-0 w-full padding fixed md:w-full h-16 backdrop-blur items-center z-50 justify-between border-b'>
      <Link href={'/'} className='flex items-center gap-2'>
        <Image src={'/icons/logo/logo.svg'} alt='logo' width={25} height={25} />
        <h1 className='md:flex text-xl font-[1000] text-foreground'>TYCH</h1>
      </Link>
      <div className='flex items-center gap-1'>
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