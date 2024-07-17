import React from 'react'
import { Card, CardContent } from '../ui/card'
const Overview = () => {
    return (
        <div className='flex flex-col padding gap-10 w-full text-center md:text-left lg:justify-center py-20 lg:h-screen'>
            <div className='flex flex-col gap-12 md:gap-20 w-full'>
                <div className='w-full flex flex-col gap-10 lg:flex-row'>
                    <div className='w-full flex-col flex gap-5 md:w-2/3 lg:w-1/2'>
                        <h1 className='font-thin text-6xl'>Overview</h1>
                        <p className='text-muted-foreground'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse maxime explicabo laborum velit tempora placeat odio aliquam quae unde, veritatis quam libero cupiditate asperiores officia, minima magni ipsa voluptate repellendus.</p>
                    </div>
                    <div className='w-full h-72 bg-muted flex items-center justify-center border'>
                            Images Here
                    </div>
                </div>
                <div className='flex w-full items-center gap-10 flex-wrap'>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className='w-full sm:max-w-64'>
                            <CardContent className='w-full py-8 flex items-center justify-center flex-col gap-8'>
                                <h1 className='text-2xl font-black'>120K</h1>
                                <h2 className='text-muted-foreground'>random text here</h2>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Overview