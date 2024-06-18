'use client'
import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '../ui/button'

const ConnectWalletButton = () => {

    return (
        <>
            <ConnectButton.Custom>
                {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    authenticationStatus,
                    mounted,
                }) => {

                    const ready = mounted && authenticationStatus !== 'loading';
                    const connected =
                        ready &&
                        account &&
                        chain &&
                        (!authenticationStatus ||
                            authenticationStatus === 'authenticated');

                    return (
                        <div
                            {...(!ready && {
                                'aria-hidden': true,
                                'style': {
                                    opacity: 0,
                                    pointerEvents: 'none',
                                    userSelect: 'none',
                                },
                            })}
                        >
                            {(() => {
                                if (!connected) {
                                    return (
                                        <Button onClick={openConnectModal}>
                                            Connect Wallet
                                        </Button>
                                    );
                                }

                                if (chain.unsupported) {
                                    return (
                                        <button onClick={openChainModal}>
                                            Wrong network
                                        </button>
                                    );
                                }

                                return (
                                    <div >
                                        <Button onClick={openAccountModal} variant={'outline'}>
                                            {account.displayName}
                                        </Button>
                                    </div>
                                );
                            })()}
                        </div>
                    );
                }}
            </ConnectButton.Custom>
        </>
    )
}

export default ConnectWalletButton