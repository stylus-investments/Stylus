'use client'
import AppHeader from '@/components/app/AppHeader'
import Dashboard from '@/components/app/Dashboard'
import useSessionStore from '@/states/app/sessionStore'
import React, { useEffect } from 'react'
const AppPage = () => {

    const getAuthSession = useSessionStore(s => s.getAuthSession)

    useEffect(() => {
        getAuthSession()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <AppHeader />
            <Dashboard />
        </>
    )
}

export default AppPage