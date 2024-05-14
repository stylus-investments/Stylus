import Footer from '@/components/home/footer'
import Graphene from '@/components/home/graphene'
import Header from '@/components/home/header'
import Main from '@/components/home/main'
import Partners from '@/components/home/partners'
import React from 'react'

const HomePage = () => {
  return (
    <div className='padding lg:container'>
      <Header />
      <Main />
      <Partners />
      <Graphene />
      <Footer />
    </div>
  )
}

export default HomePage