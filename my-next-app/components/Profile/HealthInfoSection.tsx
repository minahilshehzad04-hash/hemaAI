'use client'

import { HealthInfo } from '@/types/profile'
import AuthInput from '@/components/Auth/AuthInput'

interface HealthInfoSectionProps {
  health: HealthInfo
  isEditing: boolean
  isActive: boolean
  onHealthChange: (health: HealthInfo) => void
}

export default function HealthInfoSection({
  health,
  isEditing,
  isActive,
  onHealthChange
}: HealthInfoSectionProps) {
  // Handle health input changes
  const handleHealthChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    onHealthChange({ ...health, [name]: value })
  }

  // Handle date input changes specifically
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    onHealthChange({ ...health, [name]: value })
  }

  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Health Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gender Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            name="gender"
            value={health.gender}
            onChange={handleHealthChange}
            disabled={!isEditing || !isActive}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <AuthInput
            type="date"
            value={health.dob}
            name="dob"
            onChange={handleDateChange}
            disabled={!isEditing || !isActive}
          />
        </div>

        {/* Blood Group Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
          <select
            name="blood_group"
            value={health.blood_group}
            onChange={handleHealthChange}
            disabled={!isEditing || !isActive}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition"
          >
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>

      </div>
    </div>
  )
}