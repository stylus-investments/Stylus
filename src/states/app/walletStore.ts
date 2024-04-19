import axios from 'axios';
import { toast } from 'sonner';
import { create } from 'zustand'
import useSessionStore from './sessionStore';
import useTokenStore from './dashboardStore';

declare global {
    interface Window {
        ethereum: any; // or unknown
    }
}

interface WalletProps {
    connectWallet: () => Promise<any>
    walletListener: (address: string) => Promise<void>
    disconnectWallet: () => Promise<string | number | void>
}

const useWalletStore = create<WalletProps>((set, get) => ({
    connectWallet: async () => {
        const { session, setSession } = useSessionStore.getState()

        if (!session.address) {
            if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
                try {
                    /* Metamask is installed*/

                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

                    if (accounts.length > 0) {
                        const { data } = await axios.post('/api/auth/session', { wallet_address: accounts[0] })

                        if (data.ok) {
                            setSession(data.data)
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
    walletListener: async (address: string) => {

        const { setSession } = useSessionStore.getState()
        const { clearToken } = useTokenStore.getState()

        if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {

            if (address) {

                window.ethereum.on("accountsChanged", async (accounts: string[]) => {

                    if (accounts.length > 0) {
                        try {

                            const { data } = await axios.patch('/api/auth/session', { wallet_address: accounts[0] })
                            if (data.ok) {
                                setSession(data.data)
                                return toast.success("Wallet Changed!")
                            }
                            return alert("Something went wrong")

                        } catch (error) {
                            console.log(error);
                            alert("Something went wrong")
                        }
                    } else {
                        const { data } = await axios.delete('/api/auth/session')
                        if (data.ok) {
                            setSession(data.data)
                            clearToken()
                            return toast.success("Wallet Disconnected!")
                        }
                    }
                })
            }

        } else {
            alert("Please Install Metamask")
        }
    },
    disconnectWallet: async () => {

        const { session } = useSessionStore.getState()

        if (typeof window !== "undefined" && typeof window.ethereum !== "undefined" && session.address) {
            try {
                //disconnect metamask
                await window.ethereum.request({
                    method: "wallet_revokePermissions",
                    params: [
                        {
                            "eth_accounts": {}
                        }
                    ]
                })

            } catch (error) {
                console.log(error);
                alert("Something went wrong")
            }
        }
    }
}))

export default useWalletStore