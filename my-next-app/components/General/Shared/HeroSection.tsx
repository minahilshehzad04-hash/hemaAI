'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { CTAButton } from './CTAButton'

interface HeroSectionProps {
  title: string | ReactNode
  subtitle: string
  backgroundImage?: string
  gradient?: string
  overlay?: boolean
  decorationIcon?: ReactNode
  primaryButton?: {
    text: string
    href?: string
    onClick?: () => void
    variant?: 'primary' | 'secondary' | 'outline' | 'white'
    icon?: ReactNode
  }
  secondaryButton?: {
    text: string
    onClick: () => void
  }
  center?: boolean
  children?: ReactNode
  className?: string
}

export const HeroSection = ({
  title,
  subtitle,
  backgroundImage,
  gradient = 'animate-blueShift',
  overlay = true,
  decorationIcon,
  primaryButton,
  secondaryButton,
  center = true,
  children,
  className = ''
}: HeroSectionProps) => {
  return (
    <section className={`relative overflow-hidden bg-gradient-to-br ${gradient} text-white ${className}`}>
      {backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url("${backgroundImage}")` }}
          />
          {overlay && <div className="absolute inset-0 bg-black/40 z-0" />}
        </>
      )}
      
      <div className={`relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24 ${center ? 'text-center' : ''}`}>
        {decorationIcon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            {decorationIcon}
          </motion.div>
        )}
        
        <motion.h1 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
        >
          {title}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-lg md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed"
        >
          {subtitle}
        </motion.p>
        
        {!children && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-4"
          >
            {primaryButton && (
              <CTAButton
                href={primaryButton.href}
                onClick={primaryButton.onClick}
                variant={primaryButton.variant || 'primary'}
                className={primaryButton.icon ? 'flex items-center gap-2' : ''}
              >
                {primaryButton.icon}
                {primaryButton.text}
              </CTAButton>
            )}
            
            {secondaryButton && (
              <CTAButton
                onClick={secondaryButton.onClick}
                variant="outline"
              >
                {secondaryButton.text}
              </CTAButton>
            )}
          </motion.div>
        )}
        
        {children}
      </div>
    </section>
  )
}