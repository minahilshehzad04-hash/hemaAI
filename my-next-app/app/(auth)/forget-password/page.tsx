'use client'

import { useState } from 'react'
import { AuthService } from '@/lib/auth-service'
import Link from 'next/link'
import AuthContainer from '@/components/Auth/AuthContainer'
import AuthInput from '@/components/Auth/AuthInput'
import AuthButton from '@/components/Auth/AuthButton'
import AuthMessage from '@/components/Auth/AuthMessage'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const sendResetEmail = async () => {
    if (!email) {
      setMessage('⚠️ Please enter your email.')
      return
    }

    setLoading(true)
    const { error, message: msg } = await AuthService.resetPassword(email)
    setLoading(false)

    if (error) {
      setMessage('❌ ' + error.message)
    } else {
      setMessage('✅ ' + (msg || 'Reset link sent! Check your inbox.'))
    }
  }

  return (
<AuthContainer title="Forgot Password">
      {message && <AuthMessage message={message} />}

      <form onSubmit={sendResetEmail} className="space-y-4">
        <AuthInput
          name="Email"
          type="email"
          value={email}
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthButton type="submit" text="Send Reset Link" loading={loading} />
      </form>

      <p className="text-center text-sm text-gray-600 mt-4">
        Remembered your password?{' '}
        <Link href="/login" className="text-[#1976D2] hover:underline">
          Log In
        </Link>
      </p>
    </AuthContainer>
  )
}
