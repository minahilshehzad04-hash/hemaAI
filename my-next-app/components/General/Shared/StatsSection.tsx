'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface StatItem {
  icon: ReactNode
  label: string
  value: string
  description: string
}

interface StatsSectionProps {
  stats: StatItem[]
  bgColor?: string
}

export const StatsSection = ({
  stats,
  bgColor = 'bg-white'
}: StatsSectionProps) => {
  return (
    <section className={`py-20 ${bgColor}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">
                {stat.label}
              </h3>
              <p className="text-gray-600 text-sm">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}