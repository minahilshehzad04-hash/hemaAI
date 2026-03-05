'use client'

import * as React from 'react'

interface AvatarProps {
  src?: string
  name?: string
  size?: number
}

export function Avatar({ src, name = '', size = 96 }: AvatarProps) {
  const initials = name
    ? name
        .split(' ')
        .map(n => n[0]?.toUpperCase())
        .join('')
        .slice(0, 2)
    : '?'

  return (
    <div
      className="rounded-full overflow-hidden flex items-center justify-center bg-gray-200 text-gray-600 font-semibold"
      style={{ width: size, height: size }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-lg">{initials}</span>
      )}
    </div>
  )
}
