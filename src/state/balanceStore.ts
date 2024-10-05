import { create } from 'zustand'

interface BalanceStoreProps {
    currency: string
    setCurrency: (currency: string) => void,
    showBalance: boolean
    setShowBalance: () => void
}

const useBalanceStore = create<BalanceStoreProps>((set) => ({
    currency: "USD",
    setCurrency: (currency: string) => set({ currency }),
    showBalance: true,
    setShowBalance: () => set((state) => ({ showBalance: !state.showBalance }))
}))

export default useBalanceStore