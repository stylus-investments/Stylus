import React from 'react'
import { Separator } from './separator'
import { Label } from './label'

const LabelSeparator = ({ text }: { text: string }) => {
    return (
        <div className='relative py-5'>
            <Separator />
            <Label className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-5 bg-card lg:text-base">{text}</Label>
        </div>
    )
}

export default LabelSeparator