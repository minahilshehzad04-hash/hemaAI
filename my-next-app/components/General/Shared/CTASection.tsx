'use client'

import { motion } from 'framer-motion'
import { CTAButton } from './CTAButton'
import { LucideIcon } from 'lucide-react'

interface CTASectionProps {
  title: string
  description: string
  buttonText: string
  buttonHref?: string
  buttonOnClick?: () => void
  buttonIcon?: LucideIcon
  gradient?: string
  bgColor?: string
}

export const CTASection = ({
  title,
  description,
  buttonText,
  buttonHref,
  buttonOnClick,
  buttonIcon,
  gradient,
  bgColor = 'animate-blueShift'
}: CTASectionProps) => {
  return (
    <section className={`py-20 text-white text-center ${gradient || bgColor}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto px-6"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-6">{title}</h2>
        <p className="text-lg mb-8">{description}</p>
        <CTAButton
          href={buttonHref}
          onClick={buttonOnClick}
          variant="primary"
          icon={buttonIcon}
          className="mx-auto"
        >
          {buttonText}
        </CTAButton>
      </motion.div>
    </section>
  )
}