'use client';

import { PrivyProvider } from '@privy-io/react-auth';

export default function Privy({ children }: { children: React.ReactNode }) {

    return (
        <PrivyProvider
            config={{
                appearance: {
                    theme: "dark"
                },
                embeddedWallets: {
                    createOnLogin: 'all-users',
                }
            }}
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
            clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID as string}
        >

            {children}
        </PrivyProvider>
    );
}