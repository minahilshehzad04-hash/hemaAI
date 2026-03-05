'use client'

import { Calendar, User, Video, MessageCircle } from 'lucide-react'
import { cn, getStatusBadgeClass, formatTime } from '@/lib/utils'

interface TodayScheduleProps {
  consultations: any[]
  userType: 'patient' | 'doctor'
  onStartChat?: (consultation: any) => void
  loading?: boolean
}

export function TodaySchedule({
  consultations,
  userType,
  onStartChat,
  loading = false
}: TodayScheduleProps) {
  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-3">
              <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded-xl" />
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-600 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const todayDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  })

  return (
    <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Today's Schedule
        </h3>
        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
          {todayDate}
        </span>
      </div>
      
      <div className="space-y-4">
        {consultations.length > 0 ? (
          consultations.map((consultation) => {
            const userName = userType === 'doctor' 
              ? consultation.patient?.full_name || 'Patient'
              : `Dr. ${consultation.doctor?.full_name || 'Doctor'}`
            
            const userSpecialization = consultation.doctor_profile?.specialization || 'General Consultation'
            const status = consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)
            const time = formatTime(consultation.scheduled_time || consultation.created_at)

            return (
              <div 
                key={consultation.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl border border-blue-200 dark:border-blue-700 flex items-center justify-center shadow-sm flex-shrink-0">
                    <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {userName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {time}
                    </p>
                    {userType === 'patient' && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate">
                        {userSpecialization}
                      </p>
                    )}
                    <span className={cn(
                      "inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium",
                      getStatusBadgeClass(consultation.status)
                    )}>
                      {status}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {(consultation.status === 'accepted' || consultation.status === 'rescheduled') && (
                    <>
                      {userType === 'patient' && onStartChat && (
                        <button
                          onClick={() => onStartChat(consultation)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Start Chat
                        </button>
                      )}
                    </>
                  )}
                  {consultation.status === 'pending' && (
                    <button className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2">
                      Pending Approval
                    </button>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No appointments today
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {userType === 'doctor' ? 'Enjoy your day off!' : 'You\'re all caught up!'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}