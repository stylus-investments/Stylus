import React from 'react'
import { Button } from '../ui/button'
import Link from 'next/link'
import { CircleUserRound } from 'lucide-react'

const UserProfile = () => {

    return (
        <Link href={'/dashboard/profile'}>
            <Button variant={'ghost'} className='px-2.5'>
                <CircleUserRound size={25} />
            </Button>
        </Link>
    )
}

export default UserProfile