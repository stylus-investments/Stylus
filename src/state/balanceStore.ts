import { create } from 'zustand'

interface BalanceStoreProps {
    currency: string
    setCurrency: (currency: string) => void,
}

const useBalanceStore = create<BalanceStoreProps>((set) => ({
    currency: "USD",
    setCurrency: (currency: string) => set({ currency }),
}))

export default useBalanceStore