'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import ProfileLayout from '@/components/Profile/ProfileLayout'
import PersonalInfoSection from '@/components/Profile/PersonalInfoSection'
import ProfessionalInfoSection from '@/components/Profile/ProfessionalInfoSection'
import { useProfile } from '@/hooks/useProfile'
import { ProfessionalInfo } from '@/types/profile'
import avatar from '@/public/images/avatar.jpg'

export default function DoctorProfilePage() {
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
  } = useProfile('doctor')

  const supabase = createClient()

  const [professional, setProfessional] = useState<ProfessionalInfo>({
    specialization: '',
    license_number: '',
    qualifications: []
  })
  const [newQualification, setNewQualification] = useState('')

  useEffect(() => {
    if (user?.id) fetchProfessionalData()
  }, [user])

  const fetchProfessionalData = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from(tableName)
      .select('specialization, license_number, qualifications')
      .eq('user_id', user.id)
      .single()

    if (data && !error) {
      setProfessional({
        specialization: data.specialization || '',
        license_number: data.license_number || '',
        qualifications: Array.isArray(data.qualifications) ? data.qualifications : []
      })
    }
  }

  const addQualification = () => {
    const trimmed = newQualification.trim()
    if (!trimmed) return
    if (professional.qualifications.includes(trimmed)) {
      toast.error('Qualification already exists!')
      return
    }
    setProfessional(prev => ({
      ...prev,
      qualifications: [...prev.qualifications, trimmed]
    }))
    setNewQualification('')
    toast.success('Qualification added!')
  }

  const removeQualification = (index: number) => {
    setProfessional(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }))
    toast.success('Qualification removed!')
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)

    try {
      const updates = {
        user_id: user.id,
        contact: personal.contact,
        specialization: professional.specialization,
        license_number: professional.license_number,
        qualifications: professional.qualifications,
        updated_at: new Date(),
        is_active: isActive
        // ✅ CORRECT: Don't save full URL, only file path is already saved during upload
      }

      const { error } = await supabase
        .from(tableName)
        .upsert(updates, { onConflict: 'user_id' })

      if (error) throw error
      toast.success('Profile saved successfully!')
      setIsEditing(false)
    } catch (err) {
      console.error(err)
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProfileLayout
      user={user}
      loading={loading}
      title="Doctor Profile"
      description="Manage your personal and professional information"
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
      <ProfessionalInfoSection
        professional={professional}
        newQualification={newQualification}
        isEditing={isEditing}
        isActive={isActive}
        onProfessionalChange={setProfessional}
        onNewQualificationChange={setNewQualification}
        onAddQualification={addQualification}
        onRemoveQualification={removeQualification}
      />
    </ProfileLayout>
  )
}