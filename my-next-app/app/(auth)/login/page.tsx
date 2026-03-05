'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthService } from '@/lib/auth-service'
import Link from 'next/link'
import AuthContainer from '@/components/Auth/AuthContainer'
import AuthInput from '@/components/Auth/AuthInput'
import AuthButton from '@/components/Auth/AuthButton'
import AuthMessage from '@/components/Auth/AuthMessage'
import Divider from '@/components/Auth/Divider'
import GoogleButton from '@/components/Auth/GoogleButton'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Check for OAuth error (e.g., invalid link)
  useEffect(() => { // Check for error from OAuth callback 
    const errorParam = searchParams.get('error')
    if (errorParam) { setError(decodeURIComponent(errorParam)) }
  },
    [searchParams])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await AuthService.login(formData.email, formData.password)
    if (result.error) {
      setError(result.error.message)
      setLoading(false)
    }
    else {
      const role = result.data?.profile?.role?.toUpperCase();

      if (role) {
        router.push(`/${role.toLowerCase()}`);
      } else {
        router.push('/role-select');
      }
    }
  }

  return (
    <AuthContainer title="Log In">
      {error && <AuthMessage message={`❌ ${error}`} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          name="email"
          type="email"
          value={formData.email}
          placeholder="Enter email"
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <AuthInput
          name="password"
          type="password"
          value={formData.password}
          placeholder="Enter password"
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />

        <div className="flex justify-end">
          <Link
            href="/forget-password"
            className="text-sm text-[#1976D2] hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <AuthButton type="submit" text="Log In" loading={loading} />
      </form>

      <Divider />

      {/* ✅ Google Login (for both signup & login) */}
      <GoogleButton onClick={() => AuthService.continueWithGoogle()} loading={loading} />

      <p className="text-center text-sm text-gray-600 mt-4">
        Don't have an account?{' '}
        <Link href="/signup" className="text-[#1976D2] hover:underline">
          Sign Up
        </Link>
      </p>
    </AuthContainer>
  )
}
