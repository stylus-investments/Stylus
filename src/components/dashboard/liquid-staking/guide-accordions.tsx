'use client'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { guideTexts } from '@/constant/guideText'
import { useSession } from 'next-auth/react';
import React from 'react'

const GuideAccordions = () => {

    return (
        <div>
            <Accordion type="single" collapsible className="w-full">
                {guideTexts.map((guide, i) => (
                    <AccordionItem value={guide.title} key={i}>
                        <AccordionTrigger>{guide.title}</AccordionTrigger>
                        <AccordionContent className='text-muted-foreground text-sm'>
                            {guide.description}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}

export default GuideAccordions