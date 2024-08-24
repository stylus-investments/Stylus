'use client'

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface SessionProviderProps {
    children: ReactNode
}

const NextAuthSessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
    return <SessionProvider>
            {children}
    </SessionProvider>
};

export default NextAuthSessionProvider;
