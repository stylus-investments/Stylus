'use client'
import Base from '@/components/home/base'
import Footer from '@/components/home/footer'
import Graphene from '@/components/home/graphene'
import Header from '@/components/home/header'
import Main from '@/components/home/main'
import Partners from '@/components/home/partners'
import TeamFinance from '@/components/home/team-finance'
import React, { useEffect } from 'react'
import 'aos/dist/aos.css';
import Aos from 'aos'
import Stats from '@/components/home/stats'

const HomePage = () => {

  useEffect(() => {
    Aos.init({
      duration: 1000
    })
  }, [])

  return (
    <div className='overflow-x-hidden xl:overflow-visible'>
      <Header />
      <Main />
      {/* <Stats /> */}
      <Partners />
      <Graphene />
      <Base />
      <TeamFinance />
      <Footer />
    </div>
  )
}

export default HomePage