'use client'
import { trpc } from '@/app/_trpc/client'
import { caller } from '@/app/_trpc/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { pusherClient } from '@/lib/pusher'
import { Send } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

const OrderMessageForm = ({ initialData, sender }: {
    initialData: Awaited<ReturnType<(typeof caller['message']['getOrderMessages'])>>
    sender: 'admin' | 'user'
}) => {

    const [messages, setMessages] = useState<{
        sender: string
        content: string
        is_image: boolean
    }[]>(initialData.order_message)

    const [inputMessage, setInputMessage] = useState('')

    const sendMessage = trpc.message.sendOrderMessage.useMutation()

    useEffect(() => {

        console.log("Once")
        pusherClient.subscribe(initialData.id)

        pusherClient.bind('incoming-message', (newMessage) => {
            console.log("Received")
            setMessages(prev => ([...prev, newMessage]))
        })

        return () => {
            pusherClient.unsubscribe(initialData.id)
        }

    }, [])

    return (
        <div className='padding pt-24 w-full flex justify-center'>
            <Card className='w-[500px]'>
                <CardHeader>
                    <CardTitle>Order Messages</CardTitle>
                </CardHeader>
                <CardContent className='flex flex-col gap-2'>
                    {messages.map((message, i) => (
                        <div key={i}>
                            {message.is_image ? <Image src={message.content} alt='Message Image' width={400} height={400} className='w-full h-auto' /> : message.content}
                        </div>
                    ))}
                </CardContent>
                <CardFooter className='flex items-center gap-2'>
                    <Input placeholder='Type Message.' value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} />
                    <Button disabled={sendMessage.isPending} onClick={async (e) => {
                        e.preventDefault()
                        if (!inputMessage) return toast.error("Type a message")
                        sendMessage.mutateAsync({
                            is_image: false,
                            content: inputMessage,
                            sender: sender,
                            orderID: initialData.id
                        })
                        setInputMessage('')
                    }}><Send size={18} /></Button>
                </CardFooter>
            </Card>

        </div>
    )
}

export default OrderMessageForm