import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { guideTexts } from '@/constant/guideText'
import Link from 'next/link'
import React from 'react'

const GuideCards = () => {
    return (
        <Card>
            <CardContent className='flex flex-col gap-5 pt-5'>
                <div className='flex flex-col gap-1.5' >
                    <Label className='md:text-lg'>Global Stake</Label>
                    <p className='text-muted-foreground text-sm'>The displayed total includes all unique wallet holders of $GO tokens purchased on Graphene. It excludes $GO tokens held in smart contracts, used as liquidity in DEXs, or held in the treasury. For verification, visit the holders section of $GO tokens at:
                        <Link target='_blank' href={'https://basescan.org/token/0xb70f970876638a33859600b9e64bead0fd22b065#balances.'}>
                            <Button variant={'link'}>
                                This Link
                            </Button>
                        </Link>
                    </p>
                </div>
                <Separator />
                {guideTexts.map((guide, i) => (
                    <>
                        <div className='flex flex-col gap-1.5' key={i}>
                            <Label className='md:text-lg'>{guide.title}</Label>
                            <p className='text-muted-foreground text-sm'>{guide.description}</p>
                        </div>
                        <Separator />
                    </>
                ))}
            </CardContent>
        </Card>

    )
}

export default GuideCards