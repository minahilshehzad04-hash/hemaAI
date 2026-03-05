'use client'

import { Activity, Clock, Calendar, Video, CheckCircle, Users } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'

interface RecentActivitiesProps {
  activities: Array<{
    id: string
    title: string
    description: string
    time: string
    icon: string
    color: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'indigo' | 'orange'
  }>
  loading?: boolean
  title?: string
}

const iconMap: Record<string, any> = {
  Activity,
  Clock,
  Calendar,
  Video,
  CheckCircle,
  Users
}

export function RecentActivities({
  activities,
  loading = false,
  title = 'Recent Activities'
}: RecentActivitiesProps) {
  const colorClasses = {
    bg: {
      blue: 'bg-blue-100 dark:bg-blue-900/30',
      green: 'bg-green-100 dark:bg-green-900/30',
      yellow: 'bg-yellow-100 dark:bg-yellow-900/30',
      purple: 'bg-purple-100 dark:bg-purple-900/30',
      red: 'bg-red-100 dark:bg-red-900/30',
      indigo: 'bg-indigo-100 dark:bg-indigo-900/30',
      orange: 'bg-orange-100 dark:bg-orange-900/30'
    },
    text: {
      blue: 'text-blue-600 dark:text-blue-400',
      green: 'text-green-600 dark:text-green-400',
      yellow: 'text-yellow-600 dark:text-yellow-400',
      purple: 'text-purple-600 dark:text-purple-400',
      red: 'text-red-600 dark:text-red-400',
      indigo: 'text-indigo-600 dark:text-indigo-400',
      orange: 'text-orange-600 dark:text-orange-400'
    }
  }

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        {title}
      </h3>
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => {
            const IconComponent = iconMap[activity.icon] || Activity
            const date = new Date(activity.time)
            const formattedDate = formatDate(date)
            const formattedTime = formatTime(date)

            return (
              <div 
                key={activity.id} 
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
              >
                <div 
                  className={`p-2 rounded-lg group-hover:scale-110 transition-transform ${
                    colorClasses.bg[activity.color]
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${colorClasses.text[activity.color]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formattedDate} • {formattedTime}
                  </p>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-4">
            <Clock className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No recent activities</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Your activities will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}