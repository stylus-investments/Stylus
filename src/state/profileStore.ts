import { create } from 'zustand'

interface ProfileStore {
    open: boolean
    setOpen: (val: boolean) => void
}

const useProfileStore = create<ProfileStore>((set, get) => ({
    open: false,
    setOpen: (val: boolean) => set({ open: val })
}))

export default useProfileStore