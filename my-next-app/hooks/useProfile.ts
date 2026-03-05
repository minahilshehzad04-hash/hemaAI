'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { UserType, PersonalInfo, ProfileType } from '@/types/profile'

export function useProfile(profileType: ProfileType) {
  const supabase = createClient()

  // State
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [user, setUser] = useState<UserType | null>(null)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [personal, setPersonal] = useState<PersonalInfo>({
    full_name: '',
    email: '',
    contact: ''
  })

  const tableName = `${profileType}_profiles`
  const avatarColumn = 'profile_picture_url'

  // ✅ GET PUBLIC AVATAR URL FROM SUPABASE STORAGE
  const getAvatarUrl = (filePath: string) => {
    if (!filePath) return ''
    
    console.log('🔗 Generating Supabase URL for file:', filePath)
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)
    
    const publicUrl = data.publicUrl
    console.log('🌐 Generated Supabase URL:', publicUrl)
    return publicUrl
  }

  // ✅ FETCH PROFILE
  const fetchProfile = async () => {
    try {
      setLoading(true)
      await new Promise(r => setTimeout(r, 400))

      const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser()
      if (userError || !supabaseUser) {
        toast.error('No user logged in')
        setLoading(false)
        return
      }

      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        user_metadata: supabaseUser.user_metadata,
      })

      setPersonal(prev => ({
        ...prev,
        full_name: supabaseUser.user_metadata?.full_name || '',
        email: supabaseUser.email || ''
      }))

      // Fetch profile data
      let { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('user_id', supabaseUser.id)
        .single()

      // Profile doesn't exist → create it
      if (error && error.code === 'PGRST116') {
        const { data: newProfile, error: insertError } = await supabase
          .from(tableName)
          .insert({
            user_id: supabaseUser.id,
            created_at: new Date(),
            updated_at: new Date(),
            is_active: true,
          })
          .select()
          .single()

        if (insertError) {
          console.error('Profile creation error:', insertError)
          toast.error('Failed to create profile')
          setLoading(false)
          return
        }

        data = newProfile
        toast.success('Profile initialized successfully!')
      }

      if (data) {
        console.log('Profile data loaded:', data)
        
        // ✅ CORRECT: Use Supabase public URL instead of direct file path
        const avatarFilePath = data[avatarColumn]
        console.log('📁 Avatar file path from DB:', avatarFilePath)
        
        if (avatarFilePath) {
          const publicUrl = getAvatarUrl(avatarFilePath)
          console.log('🖼️ Setting avatar URL to:', publicUrl)
          setAvatarUrl(publicUrl)
        } else {
          console.log('❌ No avatar file path found')
          setAvatarUrl('')
        }

        setPersonal(prev => ({
          ...prev,
          contact: data.contact || data.contact_number || ''
        }))

        setIsActive(data.is_active ?? true)
      }

    } catch (err) {
      console.error('Error in fetchProfile:', err)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  // ✅ FIXED IMAGE UPLOAD WITH PROPER URL GENERATION
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !isActive) return
    const file = e.target.files?.[0]
    if (!file) return

    // Instant preview
    const reader = new FileReader()
    reader.onload = () => setAvatarUrl(reader.result as string)
    reader.readAsDataURL(file)

    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}.${fileExt}`

    setUploading(true)

    try {
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        toast.error('Failed to upload image')
        return
      }

      // ✅ Save file path in DB
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ 
          [avatarColumn]: filePath, 
          updated_at: new Date() 
        })
        .eq('user_id', user.id)

      if (updateError) {
        toast.error('Avatar uploaded but failed to save in profile')
        return
      }

      // ✅ CORRECT: Generate and set Supabase public URL
      const publicUrl = getAvatarUrl(filePath)
      console.log('✅ Final avatar URL:', publicUrl)
      setAvatarUrl(publicUrl)
      
      toast.success('Profile picture uploaded!')

    } catch (err) {
      console.error('Upload error:', err)
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  // ✅ TOGGLE ACTIVE STATUS
  const toggleActive = async () => {
    if (!user) return

    const newStatus = !isActive
    const confirmMessage = newStatus
      ? 'Are you sure you want to reactivate your account?'
      : 'Are you sure you want to deactivate your account?'

    if (!window.confirm(confirmMessage)) return

    const { error } = await supabase
      .from(tableName)
      .update({ is_active: newStatus, updated_at: new Date() })
      .eq('user_id', user.id)

    if (error) {
      toast.error('Failed to update account status')
      return
    }

    setIsActive(newStatus)
    toast.success(newStatus ? 'Account reactivated!' : 'Account deactivated!')

    if (!newStatus) setIsEditing(false)
  }

  // Update personal fields locally
  const updatePersonalInfo = (field: string, value: string) => {
    setPersonal(prev => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    fetchProfile()
  }, [profileType])

  return {
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
    fetchProfile,
    handleImageUpload,
    toggleActive,
    updatePersonalInfo,
    tableName
  }
}