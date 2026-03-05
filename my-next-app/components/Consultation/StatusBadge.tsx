'use client'

import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  PlayCircle, 
  CalendarClock 
} from 'lucide-react'

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md' | 'lg'
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const statusConfig = {
    accepted: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: PlayCircle, label: 'Accepted' },
    rejected: { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle, label: 'Rejected' },
    reschedule_pending: { color: 'bg-orange-50 text-orange-700 border-orange-200', icon: CalendarClock, label: 'Reschedule Pending' },
    pending: { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock, label: 'Pending' },
    completed: { color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle, label: 'Completed' },
    cancelled: { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: XCircle, label: 'Cancelled' },
    rescheduled: { color: 'bg-purple-50 text-purple-700 border-purple-200', icon: CalendarClock, label: 'Rescheduled' }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  const IconComponent = config.icon
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${config.color} ${sizeClasses[size]}`}>
      <IconComponent className="w-3 h-3" />
      {config.label}
    </span>
  )
}