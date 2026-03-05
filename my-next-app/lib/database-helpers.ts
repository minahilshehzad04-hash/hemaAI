// lib/database-helpers.ts
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export async function fetchPatientProfile(patientId: string) {
  try {
    // Try multiple approaches to fetch patient profile
    const { data, error } = await supabase
      .from('patient_profiles')
      .select('*')
      .eq('patient_id', patientId)
      .maybeSingle()

    if (error) {
      console.warn('Error fetching patient profile with patient_id:', error)
      
      // Try with user_id as fallback
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('patient_profiles')
        .select('*')
        .eq('user_id', patientId)
        .maybeSingle()

      if (fallbackError) {
        console.warn('Error fetching patient profile with user_id:', fallbackError)
        return null
      }

      return fallbackData
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching patient profile:', error)
    return null
  }
}

export async function fetchDoctorProfile(doctorId: string) {
  try {
    const { data, error } = await supabase
      .from('doctor_profiles')
      .select('*')
      .eq('user_id', doctorId)
      .maybeSingle()

    if (error) {
      console.warn('Error fetching doctor profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching doctor profile:', error)
    return null
  }
}

export async function fetchBasicProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching basic profile:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching basic profile:', error)
    throw error
  }
}

export async function fetchConsultations(userId: string, userType: 'patient' | 'doctor') {
  try {
    let query = supabase
      .from('consultations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50) // Reduced limit for better performance

    if (userType === 'doctor') {
      query = query.eq('doctor_id', userId)
    } else {
      query = query.eq('patient_id', userId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching consultations:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Unexpected error fetching consultations:', error)
    return []
  }
}

// Helper to get avatar URL
export function getAvatarUrl(filePath: string | null): string {
  if (!filePath) return ''
  
  // If it's already a full URL, return it
  if (filePath.startsWith('http') || filePath.startsWith('data:')) {
    return filePath
  }
  
  // If it's a Supabase storage path, generate public URL
  if (filePath.includes('avatars/')) {
    try {
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      return data.publicUrl
    } catch (error) {
      console.error('Error generating avatar URL:', error)
      return ''
    }
  }
  
  // Return as-is for other cases
  return filePath
}