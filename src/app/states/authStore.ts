import { create } from 'zustand'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner';

interface AuthProps {
    formData: {
        username: string;
        password: string;
    }
    setFormData: (data: {
        username: string;
        password: string;
    }) => void
    loading: boolean
    setLoading: (status: boolean) => void
    loginAdmin(e: React.FormEvent): Promise<void>
}

const useAuthStore = create<AuthProps>((set, get) => ({
    formData: {
        username: '',
        password: ''
    },
    loading: false,
    setLoading: (status: boolean) => set({ loading: status }),
    setFormData: (data: {
        username: string
        password: string;
    }) => set({ formData: data }),

    async loginAdmin(e: React.FormEvent) {
        e.preventDefault()
        try {

            const { setLoading, formData } = get()

            setLoading(true)
            const result = await signIn('credentials', {
                username: formData.username,
                password: formData.password,
                redirect: false
            })
            setLoading(false)
            if (result?.error) {
                toast.error('Invalid Credentials.', {
                    position: 'bottom-center'
                })
            } else {
                toast.success('Login Successfully!', {
                    position: 'bottom-center'
                })
            }

        } catch (error) {
            console.log(error);
            alert("Something went wrong")
        }
    }
}))

export default useAuthStore