'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline'
}

export function Button({ className, variant = 'default', ...props }: ButtonProps) {
  const base =
    'px-4 py-2 rounded-2xl font-medium transition-all duration-200 text-white'

  const variants = {
    default: 'bg-blue-600 hover:bg-blue-700',
    destructive: 'bg-red-600 hover:bg-red-700',
    outline: 'border border-gray-300 text-gray-700 bg-transparent hover:bg-gray-100',
  }

  return (
    <button
      className={cn(base, variants[variant], className)}
      {...props}
    />
  )
}
