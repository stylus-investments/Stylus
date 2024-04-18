'use client'
import { availableTokenToDisplay } from '@/constant/availableToken'
import useSessionStore from '@/states/app/sessionStore'
import useTokenStore from '@/states/app/tokenStore'
import React, { useEffect } from 'react'

const DisplayTokens = () => {

    const { getTokens, tokens } = useTokenStore()
    const { session } = useSessionStore()

    useEffect(() => {

        if (session.address) {
            getTokens()
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session.address])

    return (
        <div className='flex padding items-center justify-center gap-20 py-40'>
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
        </div>
    )
}

export default DisplayTokens