'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import AuthInput from '@/components/Auth/AuthInput'
import AuthButton from '@/components/Auth/AuthButton'
import avatar from '../../../../public/images/avatar.jpg'

const supabase = createClient()

interface UserType {
  id: string
  email: string
  user_metadata?: { full_name?: string }
}

export default function DonorProfile() {
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

  const [donorDetails, setDonorDetails] = useState({
    blood_group: '',
    city: '',
    availability: '',
    last_donation_date: ''
  })

  // ✅ Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)

      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (!user || userError) {
          toast.error('No user logged in')
          setLoading(false)
          return
        }

        setUser({ id: user.id, email: user.email || '', user_metadata: user.user_metadata })
        setPersonal((prev) => ({
          ...prev,
          full_name: user.user_metadata?.full_name || '',
          email: user.email || ''
        }))

        const { data: fetchedData, error } = await supabase
          .from('donor_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        let profileData = fetchedData

        // ✅ If no profile exists, try creating one
        if (error && error.code === 'PGRST116') {
          console.log('No existing donor profile found — creating new profile...')
          let newProfile = null
          let insertError = null

          for (let attempt = 1; attempt <= 2; attempt++) {
            const { data: created, error: createErr } = await supabase
              .from('donor_profiles')
              .insert({
                user_id: user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_active: true
              })
              .select()
              .single()

            if (!createErr && created) {
              newProfile = created
              insertError = null
              toast.success('Profile initialized successfully!')
              break
            } else {
              insertError = createErr
              console.warn(`Profile insert attempt ${attempt} failed:`, createErr)
              await new Promise((r) => setTimeout(r, 500))
            }
          }

          if (newProfile) {
            profileData = newProfile
          } else if (insertError) {
            console.error('Failed to create donor profile:', insertError)
          }
        } else if (error) {
          console.error('Error loading donor profile:', error)
          toast.error('Failed to load profile')
        }

        // ✅ Populate profile data if available
        if (profileData) {
          setAvatarUrl(profileData.profile_picture_url || '')
          setIsActive(profileData.is_active ?? true)
          setPersonal((prev) => ({ ...prev, contact: profileData.contact_number || '' }))
          setDonorDetails({
            blood_group: profileData.blood_group || '',
            city: profileData.city || '',
            availability: profileData.availability || '',
            last_donation_date: profileData.last_donation_date || ''
          })
        }
      } catch (err) {
        console.error('Unexpected error while loading profile:', err)
        toast.error('Unexpected error loading profile.')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  // ✅ Input handlers
  const handlePersonalChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPersonal((prev) => ({ ...prev, [name]: value }))
  }

  const handleDonorChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setDonorDetails((prev) => ({ ...prev, [name]: value }))
  }

  // ✅ Avatar upload
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
    if (uploadError) {
      console.error(uploadError)
      toast.error('Failed to upload image')
    } else {
      toast.success('Profile picture uploaded!')
    }
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
        blood_group: donorDetails.blood_group,
        city: donorDetails.city,
        availability: donorDetails.availability,
        last_donation_date: donorDetails.last_donation_date || null,
        profile_picture_url: avatarUrl,
        updated_at: new Date().toISOString(),
        is_active: isActive
      }

      const { error } = await supabase.from('donor_profiles').upsert(updates, { onConflict: 'user_id' })
      if (error) throw error

      toast.success('Profile saved successfully!')
      setIsEditing(false)
    } catch (err: any) {
      console.error('Error saving profile:', err)
      toast.error('Failed to save profile. Try again.')
    } finally {
      setSaving(false)
    }
  }

  // ✅ Toggle account status
  const toggleActive = async () => {
    if (!user) return
    const newStatus = !isActive

    const { error } = await supabase
      .from('donor_profiles')
      .update({ is_active: newStatus, updated_at: new Date() })
      .eq('user_id', user.id)

    if (error) {
      console.error(error)
      toast.error('Failed to update account status.')
      return
    }

    setIsActive(newStatus)
    toast.success(`Account ${newStatus ? 'reactivated' : 'deactivated'} successfully!`)
  }

  // ✅ Loading UI
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading profile...</p>
        </div>
      </div>
    )

  // ✅ Main UI
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl text-[#1976D2] font-bold">Donor Profile</h1>
              <p className="mt-2 text-gray-600">Manage your personal and donor information</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* ✅ Left Column */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <img
                        src={avatarUrl || avatar.src}
                        alt="Profile"
                        className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-md"
                      />
                      {uploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                          <div className="text-white text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-1"></div>
                            <p className="text-xs">Uploading...</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ✅ Image Upload Button */}
                    {isEditing && (
                      <label className="cursor-pointer bg-[#1976D2] hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center">
                        <span>{avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploading || saving}
                          className="hidden"
                        />
                      </label>
                    )}

                    {/* ✅ Account Status */}
                    <div className="mt-6 pt-6 border-t border-gray-200 w-full text-center">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Account Status</h3>
                      <div className="flex items-center justify-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-[#1976D2]' : 'bg-red-600'}`}></div>
                        <span className="text-sm text-gray-700">{isActive ? 'Active' : 'Deactivated'}</span>
                      </div>
                      <button
                        onClick={toggleActive}
                        className="mt-3 w-full bg-[#1976D2] hover:bg-[#0D47A1] text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        {isActive ? 'Deactivate Account' : 'Reactivate Account'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ Right Column */}
              <div className="lg:col-span-2">
                <div className="space-y-8">
                  {/* Personal Details */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <AuthInput value={personal.full_name} name="full_name" onChange={handlePersonalChange} disabled={!isEditing || !isActive} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <AuthInput value={personal.email} name="email" onChange={() => { }} disabled />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                        <AuthInput value={personal.contact} name="contact" onChange={handlePersonalChange} disabled={!isEditing || !isActive} />
                      </div>
                    </div>
                  </div>

                  {/* Donor Details */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Donor Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                        <AuthInput value={donorDetails.blood_group} name="blood_group" onChange={handleDonorChange} disabled={!isEditing || !isActive} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <AuthInput value={donorDetails.city} name="city" onChange={handleDonorChange} disabled={!isEditing || !isActive} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                        <textarea
                          placeholder="e.g., Weekdays 9am-5pm"
                          value={donorDetails.availability}
                          name="availability"
                          onChange={handleDonorChange}
                          disabled={!isEditing || !isActive}
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white disabled:bg-gray-100"
                          rows={3}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Donation Date</label>
                        <input
                          type="date"
                          value={donorDetails.last_donation_date || ''}
                          name="last_donation_date"
                          onChange={handleDonorChange}
                          disabled={!isEditing || !isActive}
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
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

