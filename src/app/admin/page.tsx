'use client'
import { signOut } from 'next-auth/react'
import React from 'react'

const AdminPage = () => {
  return (
    <div onClick={() => signOut()}>Signout</div>
  )
}

export default AdminPage