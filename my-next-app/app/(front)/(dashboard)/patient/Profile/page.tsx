'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import ProfileLayout from '@/components/Profile/ProfileLayout'
import PersonalInfoSection from '@/components/Profile/PersonalInfoSection'
import HealthInfoSection from '@/components/Profile/HealthInfoSection'
import { useProfile } from '@/hooks/useProfile'
import { HealthInfo } from '@/types/profile'
import avatar from '@/public/images/avatar.jpg'

export default function PatientProfilePage() {
  const {
    loading,
    saving,
    uploading,
    isEditing,
    isActive,
    user,
    avatarUrl,
    personal,
    setSaving,
    setIsEditing,
    setAvatarUrl,
    setPersonal,
    handleImageUpload,
    toggleActive,
    updatePersonalInfo,
    tableName
  } = useProfile('patient')

  const supabase = createClient()
  const [health, setHealth] = useState<HealthInfo>({
    gender: '',
    dob: '',
    blood_group: ''
  })

  const fetchHealthData = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from(tableName)
      .select('gender, dob, blood_group, profile_picture_url')
      .eq('user_id', user.id)
      .single()

    if (data && !error) {
      setHealth({
        gender: data.gender || '',
        dob: data.dob || '',
        blood_group: data.blood_group || ''
      })

      if (data.profile_picture_url) {
        setAvatarUrl(data.profile_picture_url)
      }
    }
  }

  useEffect(() => {
    fetchHealthData()
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)

    try {
      const updates = {
        user_id: user.id,
        contact_number: personal.contact,
        profile_picture_url: avatarUrl, // ensure avatar stays
        gender: health.gender,
        dob: health.dob,
        blood_group: health.blood_group,
        updated_at: new Date(),
        is_active: isActive
      }

      const { error } = await supabase
        .from(tableName)
        .upsert(updates, { onConflict: 'user_id' })

      if (error) throw error
      toast.success('Profile saved successfully!')
      setIsEditing(false)
    } catch (err) {
      console.error('Save error:', err)
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProfileLayout
      user={user}
      loading={loading}
      title="Patient Profile"
      description="Manage your personal and health information"
      avatarUrl={avatarUrl}
      isActive={isActive}
      isEditing={isEditing}
      uploading={uploading}
      saving={saving}
      onImageUpload={handleImageUpload}
      onToggleActive={toggleActive}
      onEditToggle={setIsEditing}
      onSave={handleSave}
      avatarPlaceholder={avatar.src}
    >
      <PersonalInfoSection
        personal={personal}
        isEditing={isEditing}
        isActive={isActive}
        onChange={updatePersonalInfo}
      />
      <HealthInfoSection
        health={health}
        isEditing={isEditing}
        isActive={isActive}
        onHealthChange={setHealth}
      />
    </ProfileLayout>
  )
}
