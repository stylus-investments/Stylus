import { create } from 'zustand'

interface BalanceStoreProps {
    currency: string
    setCurrency: (currency: string) => void,
}

const useBalanceStore = create<BalanceStoreProps>((set, get) => ({
    currency: "USD",
    setCurrency: (currency: string) => set({ currency }),
}))

export default useBalanceStore