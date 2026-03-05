'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/lib/auth-service'
import AuthInput from '@/components/Auth/AuthInput'
import AuthButton from '@/components/Auth/AuthButton'
import AuthMessage from '@/components/Auth/AuthMessage'
import AuthContainer from '@/components/Auth/AuthContainer'

export default function LinkAccountPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { user } = await AuthService.getCurrentUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        setFormData({ ...formData, email: user.email || '' })
      }
    }
    fetchUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const result = await AuthService.linkEmailPassword(formData.email, formData.password)
    if (result.error) {
      setError(result.error.message)
    } else {
      setMessage(result.message || 'Account linked successfully!')
      setTimeout(() => router.push('/'), 1500)
    }
    setLoading(false)
  }

  return (
    <AuthContainer title="Link Your Email & Password">
      {error && <AuthMessage message={`❌ ${error}`} />}
      {message && <AuthMessage message={`✅ ${message}`} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          name="email"
          type="email"
          value={formData.email}
          placeholder="Enter your email"
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <AuthInput
          name="password"
          type="password"
          value={formData.password}
          placeholder="Set a password"
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />

        <AuthButton type="submit" text="Link Account" loading={loading} />
      </form>
    </AuthContainer>
  )
}
