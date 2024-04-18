'use client'
import Header from '@/components/home/Header'
import axios from 'axios'
import React, { useEffect } from 'react'
import { toast } from 'sonner'

const HomePage = () => {

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.delete('/api/auth/session')

        if (data.ok) {
          toast.success("Session Deleted.")
        }

      } catch (error) {
        console.log(error);
      }
    }

    fetchData()
  }, [])
  return (
    <Header />
  )
}

export default HomePage