'use client'
import { availableTokenToDisplay } from '@/constant/availableToken'
import useSessionStore from '@/states/app/sessionStore'
import React, { useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import Image from 'next/image'
import useDashboardStore from '@/states/app/dashboardStore'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDatabase, faFlag, faGavel, faLock, faSackDollar, faSeedling } from '@fortawesome/free-solid-svg-icons'
import { Separator } from '../ui/separator'

const Dashboard = () => {

    const { getDashboardData, tokens } = useDashboardStore()
    const { session } = useSessionStore()

    useEffect(() => {

        if (session.address) {
            getDashboardData()
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session.address])

    return (
        <main className='container flex flex-col items-center py-32 gap-10'>

            <div className='flex flex-col gap-3 items-center text-center'>
                <Image width={100} height={50} className='h-auto' alt='Coin' src={'/logo.png'} />
                <div className='font-black text-3xl'>17,274.34 $GO</div>
                <h1 className='text-muted-foreground'>Total balance in your wallets</h1>
            </div>

            <Tabs defaultValue="go" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-20">
                    <TabsTrigger value="go">
                        <div className='flex items-center gap-2'>
                            <FontAwesomeIcon icon={faDatabase} width={18} height={18} className='text-primary' />
                            LIQUID STAKING
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value="grow">
                        <div className='flex items-center gap-2'>
                            <FontAwesomeIcon icon={faSeedling} width={18} height={18} className='text-primary' />
                            GROW REWARDS
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value="glow">
                        <div className='flex items-center gap-2'>
                            <FontAwesomeIcon icon={faGavel} width={18} height={18} className='text-primary' />
                            GLOW STAKING
                        </div>
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="go">
                    <Card>
                        <CardContent className="flex flex-col p-5 h-full">
                            <div className='flex items-center gap-5 pb-5 w-full'>
                                <div className='flex flex-col gap-3 w-1/4'>
                                    <div className='text-muted-foreground flex items-center gap-3'>
                                        <FontAwesomeIcon icon={faLock} width={18} height={18} />
                                        Global stake
                                    </div>
                                    <h1 className='font-black text-xl'>500,000.88 $GO</h1>
                                </div>
                                <Separator orientation='vertical' className='h-24 ml-1' />
                                <div className='flex flex-col gap-3 w-1/4'>
                                    <div className='text-muted-foreground flex items-center gap-3'>
                                        <FontAwesomeIcon icon={faFlag} width={18} height={18} />
                                        Next snapshot
                                    </div>
                                    <h1 className='font-black text-xl'>
                                        {new Date().toLocaleString('en-US', {
                                            weekday: 'short', // abbreviated day of the week (e.g., Tue)
                                            day: '2-digit', // 2-digit day of the month (e.g., 30)
                                            month: 'short', // abbreviated month name (e.g., Apr)
                                            year: 'numeric', // 4-digit year (e.g., 2024)
                                            hour: '2-digit', // 2-digit hour (e.g., 11)
                                            minute: '2-digit', // 2-digit minute (e.g., 00)
                                            second: '2-digit', // 2-digit second (e.g., 00)
                                            timeZone: 'UTC',
                                            timeZoneName: 'short' // abbreviated time zone name (e.g., UTC)
                                        })}
                                    </h1>
                                </div>
                                <div className='w-1/2'>

                                </div>
                            </div>
                            <Separator />
                            <div className='flex items-center gap-10 py-5 w-full'>
                                <div className='flex flex-col gap-3 w-1/4'>
                                    <div className='text-muted-foreground flex items-center gap-3'>
                                        <FontAwesomeIcon icon={faLock} width={18} height={18} />
                                        <div>
                                            Your stake
                                        </div>
                                        <Button className='rounded-2xl h-7 bg-orange-400 text-foreground hover:bg-orange-400'>
                                            Holding
                                        </Button>
                                        <Button className='h-7 rounded-2xl bg-green-500 hover:bg-green-500'>
                                            Active
                                        </Button>

                                    </div>
                                    <h1 className='font-black text-xl'>17,274.34 $GO</h1>
                                    <small className='text-muted-foreground'>Snapshot balance</small>
                                </div>
                                <Separator orientation='vertical' className='h-24' />
                                <div className='flex flex-col gap-3 w-1/4'>
                                    <div className='text-muted-foreground flex items-center gap-3'>
                                        <FontAwesomeIcon icon={faSackDollar} width={18} height={18} />
                                        Current Balance
                                    </div>
                                    <h1 className='font-black text-xl'>
                                        17,274.34 $GO
                                    </h1>
                                    <small className='text-muted-foreground'>Claimed and unclaimed</small>
                                </div>
                                <div className='flex flex-col gap-3 w-1/2 bg-muted p-4'>
                                    <div className='text-muted-foreground flex items-center gap-3'>
                                        <FontAwesomeIcon icon={faSackDollar} width={18} height={18} />
                                        Upcoming Rewards
                                    </div>
                                    <div className='w-full flex items-center justify-between'>
                                        <h1 className='font-black text-xl'>
                                            17,274.34 GLOW
                                        </h1>
                                        <Button disabled>Claim Rewards</Button>
                                    </div>
                                    <small className='text-muted-foreground'>Compounding in your stake</small>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="glow">
                    <Card>
                        <CardHeader className='text-center'>
                            Coming Soon.
                        </CardHeader>
                    </Card>
                </TabsContent>
                <TabsContent value="grow">
                    <Card>
                        <CardHeader className='text-center'>
                            Coming Soon.
                        </CardHeader>
                    </Card>
                </TabsContent>
            </Tabs>
        </main>
    )
}

export default Dashboard
/* <div className='flex items-center justify-center gap-20'>
    {tokens && tokens.length > 0 ? (
        <>
            {tokens.filter(token => availableTokenToDisplay.includes(token.symbol)).sort((a, b) => availableTokenToDisplay.indexOf(a.symbol) - availableTokenToDisplay.indexOf(b.symbol)).map(token => (
                <div key={token.token_address} className='flex flex-col gap-10 items-center text-center'>
                    <h1 className='text-5xl font-black'>{token.symbol}</h1>
                    <div className='text-2xl font-bold'>
                        {Number.isInteger(Number(token.balance_formatted)) ? token.balance_formatted : Number(token.balance_formatted).toFixed(8)}
                    </div>
                </div>
            ))}
            {availableTokenToDisplay.filter(item => !tokens.some(token => token.symbol === item)).map(item => (
                <div key={item} className='flex flex-col gap-10 items-center text-center'>
                    <h1 className='text-5xl font-black'>{item}</h1>
                    <div className='text-2xl font-bold'>0</div>
                </div>
            ))}
        </>
    ) : (
        availableTokenToDisplay.map(item => (
            <div key={item} className='flex flex-col gap-10 items-center text-center'>
                <h1 className='text-5xl font-black'>{item}</h1>
                <div className='text-2xl font-bold'>0</div>
            </div>
        ))
    )}
</div> */