'use client'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { user_info } from '@prisma/client'
import { Ellipsis } from 'lucide-react'
import React, { useState } from 'react'
import ViewUserProfile from './view-user-profile'

const UserTableOperation = ({ user }: {
  user: user_info
}) => {

  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>
        <Button className='w-12 p-0 h-7'>
          <Ellipsis size={25} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Operations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ViewUserProfile user={user} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserTableOperation