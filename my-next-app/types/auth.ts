export type UserRole = 'PATIENT' | 'DOCTOR' | 'DONOR' | 'ADMIN'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  email_verified: boolean
  created_at: string
  updated_at: string
}

export interface SignUpData {
  email: string
  password: string
  full_name: string
  role: UserRole
}

interface DonorProfileData {
  blood_group?: string
  city?: string
  contact_number?: string
  last_donation_date?: string | null
}

interface PersonalData {
  full_name?: string
  profile_picture_url?: string
  contact_number?: string
}