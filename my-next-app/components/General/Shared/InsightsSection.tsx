'use client'

import { motion } from 'framer-motion'
import { AnimatedCard } from './AnimatedCard'
import { ReactNode } from 'react'

interface InsightItem {
  icon: ReactNode
  title: string
  description: string
}

interface InsightsSectionProps {
  title: string
  subtitle?: string
  insights: InsightItem[]
  bgColor?: string
  gradient?: string
}

export const InsightsSection = ({
  title,
  subtitle,
  insights,
  bgColor = 'bg-white',
  gradient
}: InsightsSectionProps) => {
  return (
    <section className={`py-20 ${gradient || bgColor}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {title}
          </motion.h2>
          {subtitle && (
            <motion.p
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {insights.map((insight, index) => (
            <AnimatedCard
              key={index}
              delay={index * 0.1}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="mb-4">{insight.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{insight.title}</h3>
              <p className="text-gray-600 leading-relaxed">{insight.description}</p>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  )
}