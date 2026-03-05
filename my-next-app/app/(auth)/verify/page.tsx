'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client';

export default function VerifyPage() {
  const [message, setMessage] = useState('Verifying your email...')
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setMessage('✅ Email verified successfully! Redirecting to login...')
        setTimeout(() => router.push('/login'), 2000)
      } else {
        setMessage('⚠️ Verification failed or link expired.')
      }
    }

    checkUser()
  }, [router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-semibold text-[#1976D2] mb-3">
          {message}
        </h2>
      </div>
    </div>
  )
}
