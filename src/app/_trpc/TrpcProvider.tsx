'use client'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { httpBatchLink } from "@trpc/client"
import React, { useState } from 'react'

import { trpc } from './client'

const TrpcProvider = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false
            }
        }
    }));
    const [trpcClient] = useState(() => trpc.createClient({
        links: [
            httpBatchLink({
                url: `${process.env.NEXT_PUBLIC_URL as string}/api/trpc`
            })
        ]
    }))

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </trpc.Provider>
    )
}

export default TrpcProvider
