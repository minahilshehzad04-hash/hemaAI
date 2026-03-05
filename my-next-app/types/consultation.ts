export interface Doctor {
  id: string
  full_name?: string
  profile_picture_url?: string | null
  specialization?: string
  qualifications?: string | string[]
  license_number?: string
  verified?: boolean
  is_active?: boolean
  contact?: string
  experience?: number
  rating?: number
  consultation_fee?: number
}

export interface Patient {
  id: string
  full_name: string
  profile_picture_url: string | null
  date_of_birth?: string
  gender?: string
  contact?: string
  is_active: boolean
}

export interface Consultation {
  id: string
  patient_id: string
  doctor_id: string
  status: 'pending' | 'accepted' | 'completed' | 'rejected' | 'cancelled'
  scheduled_time?: string
  requested_time?: string
  can_message: boolean
  created_at: string
  updated_at: string
  ended_at?: string
  ended_by?: string
  patient?: {
    id: string
    full_name: string
    profile_picture_url?: string
    is_active: boolean
  }
  doctor?: {
    id: string
    full_name: string
    profile_picture_url?: string
    specialization?: string
    qualifications?: string | string[]
    license_number?: string
    verified: boolean
    is_active: boolean
    contact?: string
    experience?: number
    rating?: number
    consultation_fee?: number
  }
}

export interface ConsultationStats {
  pending: number
  inProgress: number
  completed: number
  total: number
}

export interface Message {
  id: string
  consultation_id: string
  sender_id: string
  receiver_id: string
  content: string
  message_type: 'text' | 'image' | 'file'
  read: boolean
  created_at: string
  updated_at: string
  sender?: {
    full_name: string
    profile_picture_url?: string
  }
}

export interface Conversation {
  doctor_id: string
  doctor: {
    id: string
    full_name: string
    profile_picture_url: string | null
    specialty: string
  }
  last_message: Message | null
  unread_count: number
  consultation_ids: string[]
  primary_consultation_id?: string
  can_message: boolean
  status: string
  all_consultations?: any[]
}

export interface ConsultationDetails {
  id: string
  patient_id: string
  doctor_id: string
  status: string
  scheduled_time?: string
  requested_time?: string
  can_message: boolean
  created_at: string
  updated_at: string
  ended_at?: string
  ended_by?: string
  doctor?: {
    id: string
    full_name: string
    profile_picture_url?: string
    specialization?: string
    qualifications?: string | string[]
    license_number?: string
    verified: boolean
    is_active: boolean
    contact?: string
    experience?: number
    rating?: number
  }
  patient?: {
    id: string
    full_name: string
    profile_picture_url?: string
    is_active: boolean
  }
}

// Message Read Receipt
export interface MessageRead {
  id: string;
  message_id: string;
  reader_id: string;
  read_at: string;
}

// Main Notification
export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'message' | 'success' | 'warning' | 'error' | 'info'
  read: boolean
  related_entity_type?: 'message' | 'consultation' | 'appointment'
  related_entity_id?: string
  created_at: string
  updated_at: string
}