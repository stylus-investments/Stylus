'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets';

export default function Privy({ children }: { children: React.ReactNode }) {

    return (
        <PrivyProvider
            config={{
                appearance: {
                    theme: "dark"
                }
            }}
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
            clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID as string}
        >
            <SmartWalletsProvider
                config={{
                    paymasterContext: {
                        mode: "SPONSORED",
                        calculateGasLimits: true,
                        expiryDuration: 300,
                        sponsorshipInfo: {
                            webhookData: {},
                            smartAccountInfo: {
                                name: "BICONOMY",
                                version: "1.1.0",
                            },
                        },
                    }
                }}
            >
                {children}
            </SmartWalletsProvider>
        </PrivyProvider>
    );
}