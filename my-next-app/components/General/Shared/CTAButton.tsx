'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface CTAButtonProps {
  href?: string
  onClick?: () => void
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'white'
  icon?: LucideIcon
  className?: string
}

export const CTAButton = ({ 
  href, 
  onClick, 
  children, 
  variant = 'primary',
  icon: Icon,
  className = ''
}: CTAButtonProps) => {
  const baseStyles = "px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
  
  const variants = {
    primary: "bg-yellow-400 text-black hover:bg-yellow-300 shadow-lg hover:shadow-xl",
    secondary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl",
    outline: "border-2 border-white text-white hover:bg-white hover:text-blue-700",
    white: "bg-white text-blue-700 hover:bg-blue-50 shadow-lg hover:shadow-xl"
  }

  const buttonContent = (
    <>
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </>
  )

  const motionButton = (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {buttonContent}
    </motion.button>
  )

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {motionButton}
      </Link>
    )
  }

  return motionButton
}