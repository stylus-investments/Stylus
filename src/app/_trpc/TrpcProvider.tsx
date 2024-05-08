'use client'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { httpBatchLink } from "@trpc/client"
import React, { useState } from 'react'
import '@rainbow-me/rainbowkit/styles.css';
import {
    getDefaultConfig,
    RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { base } from 'wagmi/chains';
import { trpc } from './client'

const config = getDefaultConfig({
    appName: 'Growpoint',
    projectId: process.env.NEXT_PUBLIC_WALLET_PROJECT_ID as string,
    chains: [base],
    ssr: true, // If your dApp uses server side rendering (SSR)
});
import { RainbowKitSiweNextAuthProvider, GetSiweMessageOptions } from '@rainbow-me/rainbowkit-siwe-next-auth';


const getSiweMessageOptions: GetSiweMessageOptions = () => ({
    statement: 'Sign in to Growpoint',
});

const TrpcProvider = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                refetchOnReconnect: false
            }
        }
    }));
    const [trpcClient] = useState(() => trpc.createClient({
        links: [
            httpBatchLink({
                url: '/api/trpc'
            }),
        ]
    }))

    return (
        <WagmiProvider config={config}>
            <trpc.Provider client={trpcClient} queryClient={queryClient}>
                <QueryClientProvider client={queryClient}>
                    <RainbowKitSiweNextAuthProvider
                        getSiweMessageOptions={getSiweMessageOptions}
                    >
                        <RainbowKitProvider>
                            {children}
                        </RainbowKitProvider>
                    </RainbowKitSiweNextAuthProvider>
                </QueryClientProvider>
            </trpc.Provider>
        </WagmiProvider >
    )
}

export default TrpcProvider

