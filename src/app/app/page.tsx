'use client'
import AppHeader from '@/components/app/AppHeader'
import DisplayTokens from '@/components/app/DisplayTokens'
import useSessionStore from '@/states/app/sessionStore'
import React, { useEffect } from 'react'
const AppPage = () => {

    const { session, getAuthSession } = useSessionStore()

    useEffect(() => {
        getAuthSession()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <AppHeader session={session} />
            <DisplayTokens />
        </>
    )
}

export default AppPage