'use client'
import { trpc } from '@/app/_trpc/client'
import { caller } from '@/app/_trpc/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { pusherClient } from '@/lib/pusher'
import { UploadButton } from '@/lib/utils'
import { LoaderCircle, Send, UploadCloud } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import OrderTimer from './order-timer'

const OrderMessageForm = ({ initialData, sender }: {
    initialData: Awaited<ReturnType<(typeof caller['message']['getOrderMessages'])>>
    sender: 'admin' | 'user'
}) => {

    const [messages, setMessages] = useState<{
        sender: string
        content: string
        is_image: boolean
        created_at: Date
    }[]>(initialData.order_message)

    const [inputMessage, setInputMessage] = useState('')

    const sendMessage = trpc.message.sendOrderMessage.useMutation({
        onError: (err) => {
            toast.error(err.message)
        }
    })

    useEffect(() => {

        pusherClient.subscribe(initialData.id)

        pusherClient.bind('incoming-message', (newMessage) => {
            setMessages(prev => ([...prev, newMessage]))
        })

        return () => {
            pusherClient.unsubscribe(initialData.id)
        }

    }, [initialData.id])

    return (
        <form className='w-full flex justify-center' onSubmit={
            async (e) => {
                e.preventDefault()
                if (!inputMessage) return toast.error("Type a message")
                sendMessage.mutateAsync({
                    is_image: false,
                    content: inputMessage,
                    sender: sender,
                    orderID: initialData.id
                })
                setInputMessage('')
            }
        }>
            <Card className='w-[500px]'>
                <CardHeader>
                    <CardTitle className='flex items-center justify-between mb-2'>
                        <div className='text-lg'>Order Details</div>
                        <OrderTimer created_at={initialData.created_at} status={initialData.status} />
                    </CardTitle>
                    <CardDescription className='flex items-center gap-5'>
                        <small>Method: {initialData.method}</small>
                        <small>Currency: {initialData.currency}</small>
                        <small>Price: {initialData.price}</small>
                        <small>STXBTC Amount: {initialData.amount}</small>
                    </CardDescription>
                </CardHeader>
                <CardContent className='flex flex-col gap-2.5 w-auto max-h-[550px] overflow-y-auto py-10'>
                    {messages.map((message, i) => {

                        if (sender === 'admin') {

                            if (message.sender === 'admin') {
                                return (
                                    <div key={i} className='bg-primary rounded-md px-4 py-3 self-end'>
                                        {message.is_image ?
                                            <Link href={message.content} target='_blank'>
                                                <Image src={message.content} alt='Message Image' width={400} height={400} className='w-full h-auto' />
                                            </Link>
                                            : message.content}
                                    </div>
                                )
                            } else {

                                return (
                                    <div key={i} className='flex self-start items-center gap-2'>
                                        <div key={i} className='bg-muted rounded-md px-4 py-3'>
                                            {message.is_image ?
                                                <Link href={message.content} target='_blank'>
                                                    <Image src={message.content} alt='Message Image' width={400} height={400} className='w-full h-auto' />
                                                </Link>
                                                : message.content}
                                        </div>
                                    </div>
                                )
                            }

                        } else {

                            if (message.sender === 'user') {

                                return (
                                    <div key={i} className='bg-primary rounded-md px-4 py-3 self-end'>
                                        {message.is_image ?
                                            <Link href={message.content} target='_blank'>
                                                <Image src={message.content} alt='Message Image' width={400} height={400} className='w-full h-auto' />
                                            </Link>
                                            : message.content}
                                    </div>
                                )
                            } else {

                                return (
                                    <div key={i} className='flex self-start items-start gap-2'>
                                        <Image src={'/save.webp'} alt='Stylus Logo' width={30} height={30} className='rounded-full pt-1' />
                                        <div key={i} className='bg-muted rounded-md px-4 py-3'>
                                            {message.is_image ?
                                                <Link href={message.content} target='_blank'>
                                                    <Image src={message.content} alt='Message Image' width={400} height={400} className='w-full h-auto' />
                                                </Link>
                                                : message.content}
                                        </div>
                                    </div>
                                )
                            }
                        }

                    })}
                </CardContent>
                <CardFooter className='w-full'>
                    {!initialData.closed ? <div className='flex items-center gap-2  w-full'>
                        <UploadButton
                            endpoint='orderReceiptUploader'
                            onClientUploadComplete={(res) => {
                                sendMessage.mutateAsync({
                                    is_image: true,
                                    content: res[0].url,
                                    sender: sender,
                                    orderID: initialData.id
                                })
                            }}
                            content={{
                                button({ ready }) {
                                    if (ready) return <div className='w-12 bg-primary h-full flex items-center justify-center'><UploadCloud size={18} /></div>

                                    return <Button variant={'secondary'} type='button'><LoaderCircle size={18} className='animate-spin' /></Button>
                                }
                            }}
                            onUploadError={(error: Error) => {
                                // Do something with the error.
                                toast.error(`ERROR! ${error.message}`);
                            }}
                            appearance={{
                                button: 'bg-muted text-foreground w-auto',
                                allowedContent: 'hidden',

                            }}
                        />
                        <Input placeholder='Type Message...' value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} />
                        <Button disabled={sendMessage.isPending}><Send size={18} /></Button>
                    </div> : <div className='text-center w-full pt-2 text-muted-foreground'>Conversation is closed.</div>}
                </CardFooter>
            </Card>

        </form >
    )
}

export default OrderMessageForm