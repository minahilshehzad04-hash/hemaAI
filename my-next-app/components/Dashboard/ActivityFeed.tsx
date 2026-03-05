// components/common/ActivityFeed.tsx
'use client'

import { LucideIcon, Clock } from 'lucide-react'

interface ActivityItem {
  id: string
  title: string
  description: string
  time: string | Date
  icon: LucideIcon
  color: 'green' | 'blue' | 'yellow' | 'purple'
}

interface ActivityFeedProps {
  activities: ActivityItem[]
  title?: string
  emptyMessage?: string
}

export default function ActivityFeed({
  activities,
  title = 'Recent Activities',
  emptyMessage = 'No recent activities'
}: ActivityFeedProps) {
  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-sm border border-gray-200/60 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-600" />
        {title}
      </h3>
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => {
            const IconComponent = activity.icon
            const time = typeof activity.time === 'string' 
              ? new Date(activity.time) 
              : activity.time
            
            return (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                <div className={`p-2 rounded-lg ${
                  activity.color === 'green' ? 'bg-green-100' :
                  activity.color === 'blue' ? 'bg-blue-100' :
                  activity.color === 'yellow' ? 'bg-yellow-100' : 'bg-purple-100'
                } group-hover:scale-110 transition-transform`}>
                  <IconComponent className={`w-4 h-4 ${
                    activity.color === 'green' ? 'text-green-600' :
                    activity.color === 'blue' ? 'text-blue-600' :
                    activity.color === 'yellow' ? 'text-yellow-600' : 'text-purple-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {time.toLocaleDateString()} • {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-4">
            <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  )
}