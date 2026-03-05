'use client'

import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon: LucideIcon
  color: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'orange' | 'indigo'
  loading?: boolean
  onClick?: () => void
  className?: string
}

export function StatsCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
  loading = false,
  onClick,
  className
}: StatsCardProps) {
  const colorClasses = {
    bg: {
      blue: 'bg-blue-100 dark:bg-blue-900/20',
      green: 'bg-green-100 dark:bg-green-900/20',
      purple: 'bg-purple-100 dark:bg-purple-900/20',
      red: 'bg-red-100 dark:bg-red-900/20',
      yellow: 'bg-yellow-100 dark:bg-yellow-900/20',
      orange: 'bg-orange-100 dark:bg-orange-900/20',
      indigo: 'bg-indigo-100 dark:bg-indigo-900/20'
    },
    text: {
      blue: 'text-blue-600 dark:text-blue-400',
      green: 'text-green-600 dark:text-green-400',
      purple: 'text-purple-600 dark:text-purple-400',
      red: 'text-red-600 dark:text-red-400',
      yellow: 'text-yellow-600 dark:text-yellow-400',
      orange: 'text-orange-600 dark:text-orange-400',
      indigo: 'text-indigo-600 dark:text-indigo-400'
    }
  }

  const content = (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "bg-white dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 p-6 hover:shadow-md transition-all duration-300",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
            {title}
          </p>
          {loading ? (
            <div className="h-8 w-24 mt-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {value}
              </p>
              {change && (
                <div className="flex items-center gap-1 mt-1">
                  {trend && (
                    <span className={cn(
                      "text-xs",
                      trend === 'up' ? 'text-green-600 dark:text-green-400' : 
                      trend === 'down' ? 'text-red-600 dark:text-red-400' : 
                      'text-gray-500 dark:text-gray-400'
                    )}>
                      {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
                    </span>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {change}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-xl",
          colorClasses.bg[color],
          colorClasses.text[color]
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  )

  if (onClick) {
    return (
      <button 
        onClick={onClick} 
        className="w-full text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-2xl"
      >
        {content}
      </button>
    )
  }

  return content
}