'use client'
import Base from '@/components/home/base'
import Footer from '@/components/home/footer'
import Graphene from '@/components/home/graphene'
import Header from '@/components/home/header'
import Main from '@/components/home/main'
import Partners from '@/components/home/partners'
import TeamFinance from '@/components/home/team-finance'
import React, { useEffect } from 'react'
import Overview from '@/components/home/overview'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const HomePage = () => {

  return (
    <div>
      <Header />
      <Main />
      {/* <div className='grid place-items-center pt-52'>
        <Link href={'/connect'}>
          <Button>Connect To Stylus</Button>
        </Link>
      </div> */}
      {/* <Main />
      <Partners />
      <Graphene />
      <Overview />
      <Base />
      <TeamFinance />
      <Footer /> */}
    </div>
  )
}

export default HomePage