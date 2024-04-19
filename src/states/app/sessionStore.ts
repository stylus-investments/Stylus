import { SessionData } from '@/lib/lib';
import axios from 'axios';
import { create } from 'zustand'


interface SessionProps {
    session: SessionData
    getAuthSession: () => Promise<void>
    setSession: (data: SessionData) => void
}

const useSessionStore = create<SessionProps>((set, get) => ({
    session: {
        address: '',
    },
    setSession: (data: SessionData) => {
        set({ session: data })
    },
    getAuthSession: async () => {
        try {
            const { data } = await axios.get('/api/auth/session')
            if (data.ok) set({ session: data.data })

        } catch (error) {
            console.log(error);
            alert("Something went wrong")
        }
    }
}))

export default useSessionStore