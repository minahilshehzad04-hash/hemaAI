'use client'

import { useState, ChangeEvent, KeyboardEvent } from 'react'
import { ProfessionalInfo } from '@/types/profile'
import AuthInput from '@/components/Auth/AuthInput'

interface ProfessionalInfoSectionProps {
  professional: ProfessionalInfo
  newQualification: string
  isEditing: boolean
  isActive: boolean
  onProfessionalChange: (professional: ProfessionalInfo) => void
  onNewQualificationChange: (value: string) => void
  onAddQualification: () => void
  onRemoveQualification: (index: number) => void
}

const bloodCancerSpecializations = [
  'Hematology',
  'Oncology',
  'Pediatric Hematology-Oncology',
  'Bone Marrow Transplant',
  'Radiation Oncology',
  'Surgical Oncology',
  'Gynecologic Oncology',
  'Medical Oncology',
  'Clinical Hematology',
  'Pathology',
  'Radiology'
]

export default function ProfessionalInfoSection({
  professional,
  newQualification,
  isEditing,
  isActive,
  onProfessionalChange,
  onNewQualificationChange,
  onAddQualification,
  onRemoveQualification
}: ProfessionalInfoSectionProps) {
  const [showSpecializationSuggestions, setShowSpecializationSuggestions] = useState(false)

  const filteredSpecializations = bloodCancerSpecializations.filter(spec =>
    spec.toLowerCase().includes(professional.specialization.toLowerCase())
  )

  const handleSpecializationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    onProfessionalChange({ ...professional, specialization: value })
    setShowSpecializationSuggestions(true)
  }

  const selectSpecialization = (spec: string) => {
    onProfessionalChange({ ...professional, specialization: spec })
    setShowSpecializationSuggestions(false)
  }

  const handleSpecializationFocus = () => {
    if (professional.specialization) setShowSpecializationSuggestions(true)
  }

  const handleSpecializationBlur = () => {
    setTimeout(() => setShowSpecializationSuggestions(false), 200)
  }

  const handleProfessionalChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    onProfessionalChange({ ...professional, [name]: value })
  }

  const handleQualificationKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onAddQualification()
    }
  }

  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Professional Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Specialization */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
          <div className="relative">
            <input
              type="text"
              value={professional.specialization}
              onChange={handleSpecializationChange}
              onFocus={handleSpecializationFocus}
              onBlur={handleSpecializationBlur}
              disabled={!isEditing || !isActive}
              placeholder="Type or select specialization"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition"
              list="specialization-suggestions"
            />
            {showSpecializationSuggestions && professional.specialization && filteredSpecializations.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredSpecializations.map((spec, index) => (
                  <div
                    key={index}
                    onClick={() => selectSpecialization(spec)}
                    className="px-3 py-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition"
                  >
                    {spec}
                  </div>
                ))}
              </div>
            )}
            <datalist id="specialization-suggestions">
              {bloodCancerSpecializations.map((spec, index) => (
                <option key={index} value={spec} />
              ))}
            </datalist>
          </div>
        </div>

        {/* License Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
          <AuthInput
            type="text"
            value={professional.license_number}
            name="license_number"
            onChange={handleProfessionalChange}
            disabled={!isEditing || !isActive}
            placeholder="Your license number"
          />
        </div>

        {/* Qualifications */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Qualifications {professional.qualifications.length > 0 && `(${professional.qualifications.length})`}
          </label>
          <div className="flex flex-wrap gap-2 mb-3 min-h-10">
            {professional.qualifications.length === 0 ? (
              <p className="text-gray-500 text-sm">No qualifications added yet</p>
            ) : (
              professional.qualifications.map((qual, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm transition hover:bg-blue-200"
                >
                  <span>{qual}</span>
                  {isEditing && isActive && (
                    <button
                      type="button"
                      onClick={() => onRemoveQualification(index)}
                      className="text-blue-600 hover:text-blue-800 font-bold text-lg leading-none"
                      title="Remove qualification"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {isEditing && isActive && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newQualification}
                onChange={(e) => onNewQualificationChange(e.target.value)}
                onKeyPress={handleQualificationKeyPress}
                placeholder="Add new qualification (press Enter to add)"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={onAddQualification}
                disabled={!newQualification.trim()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
