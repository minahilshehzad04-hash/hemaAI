import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export function formatTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getInitials(name: string): string {
  return name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'
}

export function generatePublicUrl(storagePath: string, bucket: string = 'avatars'): string {
  if (!storagePath) return ''
  if (storagePath.startsWith('http') || storagePath.startsWith('data:')) return storagePath
  
  // This assumes you have a function to get Supabase storage URL
  // You'll need to implement this based on your setup
  return storagePath
}

export const getConsultationStatusText = (status: string, userType: 'patient' | 'doctor'): string => {
  const statusTexts: Record<string, Record<'patient' | 'doctor', string>> = {
    pending: {
      patient: 'Waiting for doctor approval',
      doctor: 'Waiting for your approval'
    },
    accepted: {
      patient: 'Consultation scheduled',
      doctor: 'Consultation scheduled'
    },
    completed: {
      patient: 'Consultation completed',
      doctor: 'Consultation completed'
    },
    rescheduled: {
      patient: 'Consultation rescheduled',
      doctor: 'Consultation rescheduled'
    },
    cancelled: {
      patient: 'Consultation cancelled',
      doctor: 'Consultation cancelled'
    }
  }
  
  return statusTexts[status]?.[userType] || 'Consultation updated'
}

export const getStatusBadgeClass = (status: string): string => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    completed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
    rescheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  }
  return classes[status] || classes.completed
}