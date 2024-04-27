'use client'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { httpBatchLink } from "@trpc/client"
import React, { useState } from 'react'

import { trpc } from './client'

const TrpcProvider = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(() => new QueryClient({
    }));
    const [trpcClient] = useState(() => trpc.createClient({
        links: [
            httpBatchLink({
                url: '/api/trpc',
                fetch(url, options) {
                    return fetch(url, {
                        ...options,
                        credentials: 'include',
                    });
                },
                headers() {
                    return {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'X-Requested-With,content-type',
                    }
                }
            }),
        ]
    }))

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </trpc.Provider>
    )
}

export default TrpcProvider

