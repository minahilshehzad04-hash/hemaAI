// 'use client'

// import { useState, ChangeEvent, KeyboardEvent } from 'react'
// import { createClient } from '@/lib/supabase/client'
// import { toast } from 'react-hot-toast'
// import ProfileLayout from '../Profile/'
// import PersonalInfoSection from '@/components/Profile/PersonalInfoSection'
// import ProfessionalInfoSection from './Profile/ProfessionalInfoSection'
// import { useProfile } from '@/hooks/useProfile'
// import { ProfessionalInfo } from '@/types/profile'
// import avatar from '@/public/images/avatar.jpg'

// export default function DoctorProfilePage() {
//   const {
//     loading,
//     saving,
//     uploading,
//     isEditing,
//     isActive,
//     user,
//     avatarUrl,
//     personal,
//     setSaving,
//     setIsEditing,
//     setAvatarUrl,
//     setPersonal,
//     handleImageUpload,
//     toggleActive,
//     updatePersonalInfo,
//     tableName
//   } = useProfile('doctor')

//   const supabase = createClient()
  
//   const [professional, setProfessional] = useState<ProfessionalInfo>({
//     specialization: '',
//     license_number: '',
//     qualifications: []
//   })
//   const [newQualification, setNewQualification] = useState('')

//   // Fetch professional data
//   const fetchProfessionalData = async () => {
//     if (!user) return
    
//     const { data, error } = await supabase
//       .from(tableName)
//       .select('specialization, license_number, qualifications')
//       .eq('user_id', user.id)
//       .single()

//     if (data && !error) {
//       const qualificationsArray = Array.isArray(data.qualifications) 
//         ? data.qualifications 
//         : typeof data.qualifications === 'string' 
//           ? JSON.parse(data.qualifications)
//           : []

//       setProfessional({
//         specialization: data.specialization || '',
//         license_number: data.license_number || '',
//         qualifications: qualificationsArray
//       })
//     }
//   }

//   // Add qualification
//   const addQualification = () => {
//     const trimmedQual = newQualification.trim()
//     if (trimmedQual && !professional.qualifications.includes(trimmedQual)) {
//       setProfessional(prev => ({
//         ...prev,
//         qualifications: [...prev.qualifications, trimmedQual]
//       }))
//       setNewQualification('')
//       toast.success('Qualification added!')
//     } else if (professional.qualifications.includes(trimmedQual)) {
//       toast.error('Qualification already exists!')
//     }
//   }

//   // Remove qualification
//   const removeQualification = (index: number) => {
//     setProfessional(prev => ({
//       ...prev,
//       qualifications: prev.qualifications.filter((_, i) => i !== index)
//     }))
//     toast.success('Qualification removed!')
//   }

//   // Handle save
//   const handleSave = async () => {
//     if (!user) return

//     if (!personal.full_name.trim()) {
//       toast.error('Full Name is required')
//       return
//     }

//     setSaving(true)

//     try {
//       const updates = {
//         user_id: user.id,
//         contact: personal.contact,
//         specialization: professional.specialization,
//         license_number: professional.license_number,
//         qualifications: JSON.stringify(professional.qualifications),
//         profile_picture: avatarUrl,
//         updated_at: new Date(),
//         is_active: isActive
//       }

//       const { error } = await supabase
//         .from(tableName)
//         .upsert(updates, { onConflict: 'user_id' })

//       if (error) throw error
      
//       toast.success('Profile saved successfully!')
//       setIsEditing(false)
//     } catch (err) {
//       console.error('Save error:', err)
//       toast.error('Failed to save profile')
//     } finally {
//       setSaving(false)
//     }
//   }

//   return (
//     <ProfileLayout
//       user={user}
//       loading={loading}
//       title="Doctor Profile"
//       description="Manage your personal and professional information"
//       avatarUrl={avatarUrl}
//       isActive={isActive}
//       isEditing={isEditing}
//       uploading={uploading}
//       saving={saving}
//       onImageUpload={handleImageUpload}
//       onToggleActive={toggleActive}
//       onEditToggle={setIsEditing}
//       onSave={handleSave}
//       avatarPlaceholder={avatar.src}
//     >
//       <PersonalInfoSection
//         personal={personal}
//         isEditing={isEditing}
//         isActive={isActive}
//         onChange={updatePersonalInfo}
//       />

//       <ProfessionalInfoSection
//         professional={professional}
//         newQualification={newQualification}
//         isEditing={isEditing}
//         isActive={isActive}
//         onProfessionalChange={setProfessional}
//         onNewQualificationChange={setNewQualification}
//         onAddQualification={addQualification}
//         onRemoveQualification={removeQualification}
//       />
//     </ProfileLayout>
//   )
// }