export interface UserType {
  id: string
  email: string
  user_metadata?: { full_name?: string }
}

export interface PersonalInfo {
  full_name: string
  email: string
  contact: string
}

export interface ProfessionalInfo {
  specialization: string
  license_number: string
  qualifications: string[]
}

export interface HealthInfo {
  gender: string
  dob: string
  blood_group: string
}

export type ProfileType = 'doctor' | 'patient'

export interface ProfileConfig {
  type: ProfileType
  title: string
  description: string
  tableName: string
  personalFields: string[]
  specificFields: (ProfessionalInfo | HealthInfo) & { [key: string]: any }
}