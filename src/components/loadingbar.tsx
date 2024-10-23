'use client'
import React from 'react'
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

const LoadingBarComp = () => {

    return (
        <ProgressBar
            height="4px"
            startPosition={0.35}
            color="#f7b208"
            options={{ showSpinner: false }}
            shallowRouting
        />
    )
}

export default LoadingBarComp