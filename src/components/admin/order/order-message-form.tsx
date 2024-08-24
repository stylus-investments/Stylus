'use client'
import React, { useState } from 'react'

const OrderMessageForm = ({initialData}: {
    initialData: 
}) => {

    const [messages, setMessages] = useState<{
        sender: string
        content: string
        is_image: boolean
    }[]>(initialMessages)

    return (
        <div>OrderMessageForm</div>
    )
}

export default OrderMessageForm