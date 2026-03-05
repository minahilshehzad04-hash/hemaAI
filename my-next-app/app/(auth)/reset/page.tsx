'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from "@/lib/supabase/client";
import { AuthService } from '@/lib/auth-service'
import AuthContainer from '@/components/Auth/AuthContainer'
import AuthInput from '@/components/Auth/AuthInput'
import AuthButton from '@/components/Auth/AuthButton'
import AuthMessage from '@/components/Auth/AuthMessage'

export default function ResetPasswordPage() {
  const supabase = createSupabaseClient();
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    const handleRecovery = async () => {
      try {
        const url = new URL(window.location.href)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))

        // 🔑 Supabase may use either #access_token= or ?code=
        const code =
          hashParams.get('access_token') ||
          url.searchParams.get('code') ||
          url.searchParams.get('token')

        if (!code) {
          setMessage('Invalid or expired reset link. Please request a new one.')
          return
        }

        console.log('🔑 Reset code detected:', code)

        // 🧠 Try exchange
        const { data, error } = await supabase.auth.getSession()

        if (!data.session) {
          // fallback: try PKCE exchange manually
          const { data: exchangeData, error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            console.error('Exchange failed:', exchangeError)
            setMessage('Invalid or expired reset link. Please request a new one.')
            return
          }

          console.log('✅ Session restored manually:', exchangeData)
          setSessionReady(true)
        } else {
          console.log('✅ Session already active:', data.session)
          setSessionReady(true)
        }


        console.log('Exchange result:', { data, error })

        if (error) {
          setMessage('Invalid or expired reset link. Please request a new one.')
          return
        }

        if (!data?.session) {
          setMessage('Session not ready. Please reopen your reset link.')
          return
        }

        console.log('✅ Session restored successfully!')
        setSessionReady(true)
      } catch (err) {
        console.error('Recovery error:', err)
        setMessage('Something went wrong while verifying the link.')
      }
    }

    handleRecovery()
  }, [])



  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password || password !== confirmPassword) {
      setMessage('Passwords do not match or are empty.')
      return
    }

    if (!sessionReady) {
      setMessage('Session not ready. Please reopen your reset link.')
      return
    }

    setLoading(true)
    const { error } = await AuthService.updatePassword(password)
    setLoading(false)

    if (error) {
      console.error('❌ Password update failed:', error)
      setMessage('❌ ' + error.message)
    } else {
      setMessage('✅ Password updated successfully! Redirecting to login...')
      await supabase.auth.signOut()
      setTimeout(() => router.push('/login'), 2000)
    }
  }

  return (
    <AuthContainer title="Reset Password">
      {message && <AuthMessage message={message} />}
      <form onSubmit={resetPassword} className="space-y-4">
        <AuthInput
          name="New Password"
          type="password"
          value={password}
          placeholder="Enter new password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <AuthInput
          name="Confirm Password"
          type="password"
          value={confirmPassword}
          placeholder="Confirm new password"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <AuthButton type="submit" text="Reset Password" loading={loading} />
      </form>
    </AuthContainer>
  )
}
