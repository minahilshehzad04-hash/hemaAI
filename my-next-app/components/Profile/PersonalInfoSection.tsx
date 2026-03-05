'use client'

import { PersonalInfo } from '@/types/profile'
import AuthInput from '@/components/Auth/AuthInput'

interface PersonalInfoSectionProps {
  personal: PersonalInfo
  isEditing: boolean
  isActive: boolean
  onChange: (field: string, value: string) => void
  onContactChange?: (value: string) => void
}

export default function PersonalInfoSection({
  personal,
  isEditing,
  isActive,
  onChange,
  onContactChange
}: PersonalInfoSectionProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    onChange(name, value)
  }

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // Remove non-digit characters
    if (onContactChange) {
      onContactChange(value)
    } else {
      onChange('contact', value)
    }
  }

  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <AuthInput
            type="text"
            value={personal.full_name}
            name="full_name"
            onChange={handleChange}
            disabled={!isEditing || !isActive}
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <AuthInput
            type="email"
            value={personal.email}
            name="email"
            onChange={handleChange}
            disabled
            placeholder="Your email address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
          <AuthInput
            type="tel"
            value={personal.contact}
            name="contact"
            onChange={handleContactChange}
            disabled={!isEditing || !isActive}
            placeholder="Your contact number"
          />
        </div>
      </div>
    </div>
  )
}