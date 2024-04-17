import axios from 'axios';
import { toast } from 'sonner';
import { create } from 'zustand'
import useSessionStore from './sessionStore';
import useTokenStore from './tokenStore';

declare global {
    interface Window {
        ethereum: any; // or unknown
    }
}

interface WalletProps {
    connectWallet: () => Promise<any>
    walletListener: () => Promise<void>
}

const useWalletStore = create<WalletProps>((set, get) => ({
    connectWallet: async () => {
        const { getAuthSession, session } = useSessionStore.getState()
        if (!session.loggedin) {
            if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
                try {
                    /* Metamask is installed*/

                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

                    if (accounts.length > 0) {
                        const { data } = await axios.post('/api/auth/session', { wallet_address: accounts[0] })

                        if (data.ok) {
                            await getAuthSession()
                            return toast.success("Wallet Connected!")
                        }
                        return alert("Something went wrong")
                    }

                    return alert("Failed to logged in")

                } catch (error: any) {
                    console.error(error.message)
                }
            } else {
                alert("Please Install Metamask")
            }
        }

    },
    walletListener: async () => {

        const { getAuthSession, session } = useSessionStore.getState()

        if (session.loggedin) {

            if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {

                window.ethereum.on("accountsChanged", async (accounts: string[]) => {

                    const { data } = await axios.get('/api/auth/session')
                    if (data.data.loggedin) {
                        if (accounts.length > 0) {
                            try {

                                const { data } = await axios.patch('/api/auth/session', { wallet_address: accounts[0] })
                                if (data.ok) {
                                    await getAuthSession()
                                    return toast.success("Wallet Changed!")
                                }
                                return alert("Something went wrong")

                            } catch (error) {
                                console.log(error);
                                alert("Something went wrong")
                            }
                        } else {
                            try {
                                const { data } = await axios.delete('/api/auth/session')

                                if (data.ok) {
                                    const { clearToken } = useTokenStore.getState()
                                    await getAuthSession()
                                    clearToken()
                                    return toast.success("Wallet Disconnected!")
                                }

                                return alert("Something went wrong")
                            } catch (error) {
                                console.log(error);
                                alert("Something went wrong")
                            }
                        }
                    }

                })

            } else {
                alert("Please Install Metamask")
            }
        }
    }
}))

export default useWalletStore