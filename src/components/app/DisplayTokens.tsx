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

            {tokens && tokens.length > 0 ? tokens.map(token => {

                const available = ['TESTGROW', 'TESTGO', 'TESTGLOW']
                if (available.includes(token.symbol)) return (
                    <div key={token.token_address} className='flex flex-col gap-10 items-center text-center'>
                        <h1 className='text-6xl font-black'>{token.symbol}</h1>
                        <div className='text-2xl font-bold'>{token.balance_formatted}</div>
                    </div>
                )
            }) : ['TESTGROW', 'TESTGO', 'TESTGLOW'].map(item => (
                <div key={item} className='flex flex-col gap-10 items-center text-center'>
                    <h1 className='text-6xl font-black'>{item}</h1>
                    <div className='text-2xl font-bold'>0</div>
                </div>
            ))}

        </div>
    )
}

export default DisplayTokens