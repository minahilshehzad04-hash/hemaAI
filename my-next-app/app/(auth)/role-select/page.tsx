'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/lib/auth-service'
import type { UserRole } from '@/types/auth'
import { HeartIcon, Stethoscope, Droplets } from 'lucide-react'

export default function SelectRolePage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<UserRole>('PATIENT')
  const [loading, setLoading] = useState(false)
  const [checkingRole, setCheckingRole] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkRole = async () => {
      const { profile } = await AuthService.getCurrentUser()
      if (!profile?.role) {
        setCheckingRole(false)
      } else {
        router.replace(`/${profile.role.toLowerCase()}`)
      }
    }
    checkRole()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await AuthService.updateRole(selectedRole)

    if (result.error) {
      setError(result.error.message)
      setLoading(false)
    } else {
      router.replace(`/${selectedRole.toLowerCase()}`)
    }
  }

  // ✅ Spinner while checking role
  if (checkingRole)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#1976D2] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )

  // ✅ Role Options with new icons
  const roles: { value: UserRole; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      value: 'PATIENT',
      label: 'Patient',
      desc: 'I am seeking medical care',
      icon: <HeartIcon className="w-5 h-5 text-[#1976D2]" />,
    },
    {
      value: 'DOCTOR',
      label: 'Doctor',
      desc: 'I am a healthcare provider',
      icon: <Stethoscope className="w-5 h-5 text-[#1976D2]" />,
    },
    {
      value: 'DONOR',
      label: 'Donor',
      desc: 'I want to donate blood or organs',
      icon: <Droplets className="w-5 h-5 text-[#1976D2]" />,
    }, {
      value: 'ADMIN',
      label: 'Admin',
      desc: 'I am the system administrator',
      icon: <Droplets className="w-5 h-5 text-[#1976D2]" />
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl text-[#1976D2] font-bold text-center mb-2">
          Select Your Role
        </h2>
        <p className="text-gray-600 text-center mb-6 text-sm">
          Choose how you’ll use the platform
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            {roles.map((role) => (
              <label
                key={role.value}
                className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition duration-200 ${selectedRole === role.value
                  ? 'border-[#1976D2] bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  checked={selectedRole === role.value}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="mt-1 accent-[#1976D2]"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center gap-2">
                    {role.icon}
                    <span className="font-semibold text-gray-800">
                      {role.label}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 mt-1">{role.desc}</div>
                </div>
              </label>
            ))}
          </div>

          {/* ✅ Submit Button with Spinner */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1976D2] text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition flex items-center justify-center"
          >
            {loading ? (
              <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Continue'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Not sure which to choose?{' '}
          <span className="text-[#1976D2] font-medium">Learn more</span>
        </p>
      </div>
    </div>
  )
}
