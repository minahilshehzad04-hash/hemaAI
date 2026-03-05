'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/lib/auth-service'
import type { UserRole } from '@/types/auth'
import Link from 'next/link'
import AuthContainer from '@/components/Auth/AuthContainer'
import AuthInput from '@/components/Auth/AuthInput'
import AuthButton from '@/components/Auth/AuthButton'
import AuthMessage from '@/components/Auth/AuthMessage'
import Divider from '@/components/Auth/Divider'
import GoogleButton from '@/components/Auth/GoogleButton'

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: '' as UserRole,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!formData.role) {
      setError('Please select a role.')
      return
    }

    setLoading(true)
    const result = await AuthService.signUp(formData)

    if (!result) {
      setError('An unexpected error occurred. Please try again.')
    } else if (result.error) {
      setError(result.error.message)
    } else {
      setMessage('Account created successfully! Check your email for verification.')
      setTimeout(() => router.push('/login'), 2000)
    }

    setLoading(false)
  }

  return (
    <AuthContainer title="Create Account">
      {error && <AuthMessage message={`❌ ${error}`} />}
      {message && <AuthMessage message={`✅ ${message}`} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          name="Full Name"
          value={formData.full_name}
          placeholder="Enter full name"
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
        />
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

        {/* 🔽 Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Role
          </label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#1976D2]"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            required
          >
            <option value="">-- Choose Role --</option>
            <option value="PATIENT">Patient</option>
            <option value="DOCTOR">Doctor</option>
            <option value="DONOR">Donor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <AuthButton type="submit" text="Sign Up" loading={loading} />
      </form>

      <Divider />
      <GoogleButton onClick={() => AuthService.continueWithGoogle()} loading={loading} />

      <p className="text-center text-sm text-gray-600 mt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-[#1976D2] hover:underline">
          Log In
        </Link>
      </p>
    </AuthContainer>
  )
}
