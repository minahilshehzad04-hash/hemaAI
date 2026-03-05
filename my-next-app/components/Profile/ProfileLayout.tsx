'use client'

import { ReactNode } from 'react'
import { UserType } from '@/types/profile'

interface ProfileLayoutProps {
  user: UserType | null
  loading: boolean
  title: string
  description: string
  avatarUrl: string
  isActive: boolean
  isEditing: boolean
  uploading: boolean
  saving: boolean
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onToggleActive: () => void
  onEditToggle: (editing: boolean) => void
  onSave: () => void
  avatarPlaceholder: string
  children: ReactNode
}

export default function ProfileLayout({
  user,
  loading,
  title,
  description,
  avatarUrl,
  isActive,
  isEditing,
  uploading,
  saving,
  onImageUpload,
  onToggleActive,
  onEditToggle,
  onSave,
  avatarPlaceholder,
  children
}: ProfileLayoutProps) {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  // Determine which avatar to show: uploaded preview, saved URL, or placeholder
  const displayAvatar = avatarUrl || avatarPlaceholder

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl text-[#1976D2] font-bold">{title}</h1>
              <p className="mt-2 text-gray-600">{description}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Avatar + Status */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <img
                        src={displayAvatar}
                        alt="Profile"
                        className={`w-40 h-40 rounded-full object-cover border-4 border-white shadow-md transition-opacity duration-300 ${
                          uploading ? 'opacity-60' : 'opacity-100'
                        }`}
                      />
                      {uploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center">
                          <div className="text-white text-center">
                            <div className="animate-spin h-6 w-6 border-b-2 border-white rounded-full mx-auto mb-1"></div>
                            Uploading...
                          </div>
                        </div>
                      )}
                    </div>
                    <label
                      className={`cursor-pointer mt-4 px-4 py-2 rounded-lg text-white transition ${
                        isActive
                          ? 'bg-[#1976D2] hover:bg-blue-700'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {avatarUrl ? 'Change Photo' : 'Upload Photo'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onImageUpload}
                        disabled={!isActive || uploading}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Account Status</h3>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          isActive ? 'bg-[#1976D2]' : 'bg-red-600'
                        }`}
                      ></div>
                      <span className="text-sm text-gray-700">{isActive ? 'Active' : 'Deactivated'}</span>
                    </div>
                    <button
                      onClick={onToggleActive}
                      disabled={saving}
                      className="mt-3 w-full bg-[#1976D2] hover:bg-[#0D47A1] disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition"
                    >
                      {isActive ? 'Deactivate Account' : 'Reactivate Account'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="lg:col-span-2">
                <div className="space-y-8">
                  {children}

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-4 pt-4">
                    {!isEditing && isActive && (
                      <button
                        onClick={() => onEditToggle(true)}
                        className="bg-[#1976D2] hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                      >
                        Edit Profile
                      </button>
                    )}
                    {isEditing && isActive && (
                      <>
                        <button
                          onClick={() => onEditToggle(false)}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                          disabled={saving}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={onSave}
                          disabled={saving || uploading}
                          className="bg-[#1976D2] hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition"
                        >
                          {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
