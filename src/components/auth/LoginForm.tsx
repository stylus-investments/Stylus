import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import useAuthStore from '@/state/authStore'
import { LoaderCircle } from 'lucide-react'


const LoginForm = () => {

    const { formData, setFormData, loginAdmin, loading } = useAuthStore()
    const [inputType, setInputType] = useState<'text' | 'password'>('text')

    return (
        <form className='flex flex-col gap-5' onSubmit={loginAdmin}>
            <div className='flex flex-col gap-1.5'>
                <Label>Username</Label>
                <Input name='username'
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder='Username' />
            </div>
            <div className='flex flex-col gap-1.5'>
                <Label>Password</Label>
                <div className='relative w-full'>
                    <Input name='password'
                        type={inputType} value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder='Password' />
                    <FontAwesomeIcon
                        icon={inputType === 'text' ? faEyeSlash : faEye}
                        className='cursor-pointer absolute right-3 top-3' width={16} height={16}
                        onClick={() => setInputType(prev => prev === 'text' ? 'password' : 'text')}
                    />
                </div>
            </div>
            <Button disabled={loading}>{loading ? <LoaderCircle size={18} className='animate-spin' /> : "Sign In"}</Button>
        </form>
    )
}

export default LoginForm