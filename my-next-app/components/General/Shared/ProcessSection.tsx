'use client'

import { motion } from 'framer-motion'
import { AnimatedCard } from './AnimatedCard'

interface ProcessStep {
  number: string
  title: string
  description: string
  icon?: React.ReactNode
}

interface ProcessSectionProps {
  title: string
  subtitle?: string
  steps: ProcessStep[]
  bgColor?: string
  showConnectors?: boolean
}

export const ProcessSection = ({
  title,
  subtitle,
  steps,
  bgColor = 'bg-gray-50',
  showConnectors = false
}: ProcessSectionProps) => {
  return (
    <section className={`py-20 ${bgColor}`}>
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
              className="text-lg text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>

        <div className="relative">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <AnimatedCard
                key={index}
                delay={index * 0.1}
                className="text-center group"
              >
                <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 group-hover:bg-blue-700 transition-all duration-300">
                  {step.number}
                </div>
                {step.icon && (
                  <div className="text-blue-500 mb-3">{step.icon}</div>
                )}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </AnimatedCard>
            ))}
          </div>
          
          {showConnectors && (
            <div className="hidden lg:block absolute top-10 left-0 right-0 h-0.5 bg-blue-100 -z-10" />
          )}
        </div>
      </div>
    </section>
  )
}