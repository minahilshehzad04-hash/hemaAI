// 'use client'

// import { FileText, Clock, PlayCircle, CheckCircle } from 'lucide-react'
// import { ConsultationStats } from '@/types/consultation'

// interface StatsOverviewProps {
//   stats: ConsultationStats
//   loading?: boolean
//   onTabChange?: (tab: 'pending' | 'in-progress' | 'completed') => void
//   activeTab?: 'pending' | 'in-progress' | 'completed'
// }

// export function StatsOverview({ stats, loading = false, onTabChange, activeTab }: StatsOverviewProps) {
//   if (loading) {
//     return (
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         {[...Array(4)].map((_, i) => (
//           <div key={i} className="bg-white rounded-xl shadow border border-gray-200 p-4 animate-pulse">
//             <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
//             <div className="h-8 bg-gray-200 rounded w-1/3"></div>
//           </div>
//         ))}
//       </div>
//     )
//   }

//   const statCards = [
//     {
//       type: 'pending' as const,
//       title: 'Pending',
//       value: stats.pending,
//       icon: Clock,
//       color: 'yellow' as const,
//       bgColor: 'bg-yellow-100',
//       textColor: 'text-yellow-600'
//     },
//     {
//       type: 'in-progress' as const,
//       title: 'In Progress',
//       value: stats.inProgress,
//       icon: PlayCircle,
//       color: 'blue' as const,
//       bgColor: 'bg-blue-100',
//       textColor: 'text-blue-600'
//     },
//     {
//       type: 'completed' as const,
//       title: 'Completed',
//       value: stats.completed,
//       icon: CheckCircle,
//       color: 'green' as const,
//       bgColor: 'bg-green-100',
//       textColor: 'text-green-600'
//     },
//     {
//       type: 'total' as const,
//       title: 'Total',
//       value: stats.total,
//       icon: FileText,
//       color: 'gray' as const,
//       bgColor: 'bg-gray-100',
//       textColor: 'text-gray-600'
//     }
//   ]

//   const colorClasses = {
//     yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
//     blue: 'bg-blue-50 border-blue-200 text-blue-700', 
//     green: 'bg-green-50 border-green-200 text-green-700',
//     gray: 'bg-gray-50 border-gray-200 text-gray-700'
//   }

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//       {statCards.map((stat) => {
//         const IconComponent = stat.icon

//         return (
//           <div 
//             key={stat.type}
//             className={`rounded-lg p-4 border transition-all duration-200 cursor-pointer ${
//               activeTab === stat.type 
//                 ? `ring-2 ${colorClasses[stat.color]} shadow-sm`
//                 : `${colorClasses[stat.color]} hover:border-${stat.color}-300`
//             }`}
//             onClick={() => onTabChange && stat.type !== 'total' && onTabChange(stat.type)}
//           >
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium">{stat.title}</p>
//                 <p className="text-2xl font-bold mt-1">{stat.value}</p>
//               </div>
//               <div className={`p-2 rounded-lg ${stat.bgColor}`}>
//                 <IconComponent className={`w-5 h-5 ${stat.textColor}`} />
//               </div>
//             </div>
//           </div>
//         )
//       })}
//     </div>
//   )
// }


// components/StatsOverview.tsx
import { Clock, PlayCircle, CheckCircle, FileText } from 'lucide-react'
import { ConsultationStats } from '@/types/consultation'

interface StatsOverviewProps {
  stats: ConsultationStats
  loading?: boolean
  onTabChange?: (tab: 'pending' | 'in-progress' | 'completed') => void
  activeTab?: 'pending' | 'in-progress' | 'completed'
}

export default function StatsOverview({ stats, loading = false, onTabChange, activeTab }: StatsOverviewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow border border-gray-200 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      type: 'pending' as const,
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'yellow' as const,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600'
    },
    {
      type: 'in-progress' as const,
      title: 'In Progress',
      value: stats.inProgress,
      icon: PlayCircle,
      color: 'blue' as const,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      type: 'completed' as const,
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'green' as const,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      type: 'total' as const,
      title: 'Total',
      value: stats.total,
      icon: FileText,
      color: 'gray' as const,
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-600'
    }
  ]

  const colorClasses = {
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700', 
    green: 'bg-green-50 border-green-200 text-green-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const IconComponent = stat.icon

        return (
          <div 
            key={stat.type}
            className={`rounded-lg p-4 border transition-all duration-200 cursor-pointer ${
              activeTab === stat.type 
                ? `ring-2 ${colorClasses[stat.color]} shadow-sm`
                : `${colorClasses[stat.color]} hover:border-${stat.color}-300`
            }`}
            onClick={() => onTabChange && stat.type !== 'total' && onTabChange(stat.type)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <IconComponent className={`w-5 h-5 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}