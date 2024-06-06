import { toast } from 'sonner';
import { create } from 'zustand'

interface GlobalProps {
    copyText: (value: string) => void
}

const useGlobalStore = create<GlobalProps>((set, get) => ({

    copyText: (value: string) => {
        navigator.clipboard.writeText(value);
        toast.success(`Copied: ${value}`)
    }
}))

export default useGlobalStore