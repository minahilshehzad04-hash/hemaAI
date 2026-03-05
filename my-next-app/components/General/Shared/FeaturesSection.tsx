'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface FeatureItem {
  icon: ReactNode
  title: string
  description: string
}

interface FeaturesSectionProps {
  title: string
  subtitle?: string
  features: FeatureItem[]
  columns?: 2 | 3 | 4
  bgColor?: string
  centered?: boolean
  id?: string
}

export const FeaturesSection = ({
  title,
  subtitle,
  features,
  columns = 3,
  bgColor = 'bg-white',
  centered = true,
  id
}: FeaturesSectionProps) => {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <section id={id} className={`py-20 ${bgColor}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`max-w-7xl mx-auto px-6 lg:px-8 ${centered ? 'text-center' : ''}`}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {title}
        </h2>
        
        {subtitle && (
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}

        <div className={`grid grid-cols-1 ${gridCols[columns]} gap-8`}>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition"
            >
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}