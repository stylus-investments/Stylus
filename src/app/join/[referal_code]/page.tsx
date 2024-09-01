'use client'
import { setReferal } from '@/actions/referal'
import { LoaderCircle } from 'lucide-react'
import { useEffect } from 'react'

const Page = ({ params }: {
    params: {
        referal_code: string
    }
}) => {

    useEffect(() => {

        setReferal(params.referal_code)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className='flex flex-col items-center justify-center h-screen w-screen'>
            <LoaderCircle size={50} className='animate-spin text-primary' />
        </div>
    )

}

export default Page