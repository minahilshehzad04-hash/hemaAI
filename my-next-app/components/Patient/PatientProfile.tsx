'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import AuthInput from '@/components/Auth/AuthInput'
import AuthButton from '@/components/Auth/AuthButton'
import avatar from '../../public/images/avatar.jpg'

interface UserType {
  id: string
  email: string
  user_metadata?: { full_name?: string }
}

export default function PatientProfilePage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isActive, setIsActive] = useState(true)

  const [user, setUser] = useState<UserType | null>(null)
  const [avatarUrl, setAvatarUrl] = useState('')

  const [personal, setPersonal] = useState({
    full_name: '',
    email: '',
    contact: ''
  })

  const [health, setHealth] = useState({
    gender: '',
    dob: '',
    blood_group: '',
  })

  // ✅ Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        await new Promise((r) => setTimeout(r, 400))

        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          toast.error('No user logged in')
          setLoading(false)
          return
        }

        setUser({
          id: user.id,
          email: user.email || '',
          user_metadata: user.user_metadata,
        })

        setPersonal((prev) => ({
          ...prev,
          full_name: user.user_metadata?.full_name || '',
          email: user.email || '',
        }))

        let { data, error } = await supabase
          .from('patient_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error && error.code === 'PGRST116') {
          const { data: newProfile } = await supabase
            .from('patient_profiles')
            .insert({
              user_id: user.id,
              created_at: new Date(),
              updated_at: new Date(),
              is_active: true,
            })
            .select()
            .single()
          data = newProfile
          toast.success('Profile initialized successfully!')
        }

        if (data) {
          setAvatarUrl(data.profile_picture_url || '')
          setPersonal((prev) => ({ ...prev, contact: data.contact_number || '' }))
          setHealth({
            gender: data.gender || '',
            dob: data.dob || '',
            blood_group: data.blood_group || '',
          })
          setIsActive(data.is_active ?? true)
        }
      } catch (err) {
        console.error(err)
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  // ✅ Handle input changes
  const handlePersonalChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPersonal((prev) => ({ ...prev, [name]: value }))
  }

  const handleHealthChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setHealth((prev) => ({ ...prev, [name]: value }))
  }

  // ✅ Upload image
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!user) return
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => setAvatarUrl(reader.result as string)
    reader.readAsDataURL(file)

    const fileExt = file.name.split('.').pop()
    const filePath = `avatars/${user.id}.${fileExt}`

    setUploading(true)
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true })
    if (uploadError) toast.error('Failed to upload image')
    else toast.success('Profile picture uploaded!')
    setUploading(false)
  }

  // ✅ Save profile
  const handleSave = async () => {
    if (!user) return
    setSaving(true)

    try {
      const updates = {
        user_id: user.id,
        contact_number: personal.contact,
        profile_picture_url: avatarUrl,
        gender: health.gender,
        dob: health.dob,
        blood_group: health.blood_group,
        updated_at: new Date(),
        is_active: isActive
      }

      const { error } = await supabase
        .from('patient_profiles')
        .upsert(updates, { onConflict: 'user_id' })

      if (error) throw error
      toast.success('Profile saved successfully!')
      setIsEditing(false)
    } catch (err) {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  // ✅ Toggle active status
  const toggleActive = async () => {
    if (!user) return
    const newStatus = !isActive

    const { error } = await supabase
      .from('patient_profiles')
      .update({ is_active: newStatus, updated_at: new Date() })
      .eq('user_id', user.id)

    if (error) {
      toast.error('Failed to update account status.')
      return
    }

    setIsActive(newStatus)
    toast.success(`Account ${newStatus ? 'reactivated' : 'deactivated'} successfully!`)
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 text-lg">Loading your profile...</div>
      </div>
    )

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl text-[#1976D2] font-bold">Patient Profile</h1>
              <p className="mt-2 text-gray-600">Manage your personal and health information</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Avatar + Status */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex flex-col items-center">
                    <img
                      src={avatarUrl || avatar.src}
                      alt="Profile"
                      className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-md"
                    />
                    <label className="cursor-pointer bg-[#1976D2] hover:bg-blue-700 text-white px-4 py-2 mt-4 rounded-lg transition">
                      {avatarUrl ? 'Change Photo' : 'Upload Photo'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={!isActive}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Account Status</h3>
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-[#1976D2]' : 'bg-red-600'}`}></div>
                      <span className="text-sm text-gray-700">{isActive ? 'Active' : 'Deactivated'}</span>
                    </div>
                    <button
                      onClick={toggleActive}
                      className="mt-3 w-full bg-[#1976D2] hover:bg-[#0D47A1] text-white px-4 py-2 rounded-lg transition"
                    >
                      {isActive ? 'Deactivate Account' : 'Reactivate Account'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="lg:col-span-2">
                <div className="space-y-8">
                  {/* Personal Details */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <AuthInput
                          type="text"
                          value={personal.full_name}
                          name="full_name"
                          onChange={handlePersonalChange}
                          disabled={!isEditing || !isActive}
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <AuthInput
                          type="email"
                          value={personal.email}
                          name="email"
                          onChange={handlePersonalChange}
                          disabled
                        />
                      </div>

                      {/* Contact */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                        <AuthInput
                          type="number"
                          value={personal.contact}
                          name="contact"
                          onChange={handlePersonalChange}
                          disabled={!isEditing || !isActive}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Health Details */}
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
                        </select>
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <AuthInput
                          type="date"
                          value={health.dob}
                          onChange={(e) => handleHealthChange(e as any)}
                          name="dob"
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
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-4 pt-4">
                    {!isEditing && isActive && (
                      <AuthButton text="Edit Profile" onClick={() => setIsEditing(true)} />
                    )}
                    {isEditing && isActive && (
                      <AuthButton text={saving ? 'Saving...' : 'Save Profile'} onClick={handleSave} disabled={saving || uploading} />
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