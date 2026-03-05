'use client'

import { motion } from 'framer-motion'
import { AnimatedCard } from './AnimatedCard'

interface BenefitItem {
  emoji?: string
  icon?: React.ReactNode
  title: string
  description: string
}

interface BenefitsSectionProps {
  title: string
  benefits: BenefitItem[]
  gradient?: string
  bgColor?: string
}

export const BenefitsSection = ({
  title,
  benefits,
  gradient = 'bg-blue-600',
  bgColor = 'text-white'
}: BenefitsSectionProps) => {
  return (
    <section className={`py-20 ${gradient} ${bgColor}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {title}
        </motion.h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <AnimatedCard
              key={index}
              delay={index * 0.1}
              className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl hover:bg-white/20 transition-all"
            >
              <div className="text-3xl mb-4">
                {benefit.emoji || benefit.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {benefit.title}
              </h3>
              <p className="text-sm opacity-90">
                {benefit.description}
              </p>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  )
}