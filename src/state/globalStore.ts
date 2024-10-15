import { toast } from 'sonner';
import { create } from 'zustand'

interface GlobalProps {
    copyText: (value: string, message?: string) => void
}

const useGlobalStore = create<GlobalProps>((set, get) => ({

    copyText: (value: string, message?: string) => {
        navigator.clipboard.writeText(value);

        if (message) {
            toast.success(message)
        } else {
            toast.success(`Copied: ${value}`)
        }
    }
}))

export default useGlobalStore