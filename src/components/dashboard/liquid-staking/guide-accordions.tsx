import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { guideTexts } from '@/constant/guideText'
import Link from 'next/link'
import React from 'react'

const GuideAccordions = () => {
    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="Global Stake">
                <AccordionTrigger>Global Stake</AccordionTrigger>
                <AccordionContent>
                    <div className='text-muted-foreground text-sm'>
                        The displayed total includes all unique wallet holders of $GO tokens purchased on Graphene. It excludes $GO tokens held in smart contracts, used as liquidity in DEXs, or held in the treasury. For verification, visit the holders section of $GO tokens at:
                        <Link target='_blank' href={'https://basescan.org/token/0xb70f970876638a33859600b9e64bead0fd22b065#balances.'}>
                            <Button variant={'link'}>
                                This Page
                            </Button>
                        </Link>
                    </div>
                </AccordionContent>
            </AccordionItem>
            {guideTexts.map((guide, i) => (
                <AccordionItem value={guide.title} key={i}>
                    <AccordionTrigger>{guide.title}</AccordionTrigger>
                    <AccordionContent className='text-muted-foreground text-sm'>
                        {guide.description}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    )
}

export default GuideAccordions