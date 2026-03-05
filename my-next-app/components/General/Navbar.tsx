'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import logo from '../../public/images/logo.png'

import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  HeartIcon,
  PhoneIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { Stethoscope, Droplets } from 'lucide-react'

const navigation = [
  { name: 'For Patients', href: '/patients', icon: <HeartIcon className="w-4 h-4" /> },
  { name: 'For Doctors', href: '/doctors', icon: <Stethoscope className="w-4 h-4" /> },
  { name: 'For Donors', href: '/donors', icon: <Droplets className="w-4 h-4" /> },
  { name: 'About Us', href: '/about', icon: <InformationCircleIcon className="w-4 h-4" /> },
  { name: 'Contact Us', href: '/contact', icon: <PhoneIcon className="w-4 h-4" /> },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [imageError, setImageError] = useState(false)
  const pathname = usePathname()

  const authRoutes = ['/login', '/signup', '/forget-password', '/reset', '/callback', '/role-select']
  const isAuthPage = authRoutes.includes(pathname?.toLowerCase())

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40 backdrop-blur-sm bg-white/95">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-12 py-5 lg:px-8">
        {/* ✅ Logo */}
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-3 group">
            {imageError ? (
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-red-600 rounded-full text-white font-bold">
                H
              </div>
            ) : (
              <div className="relative h-12 w-14">
                <Image
                  src={logo}
                  alt="HemaAI Logo"
                  className="object-contain group-hover:scale-110 transition-transform duration-300"
                  fill
                  onError={() => setImageError(true)}
                  priority
                />
              </div>
            )}
            <span className="text-2xl font-bold bg-[#1976D2] bg-clip-text text-transparent">
              HemaAI
            </span>
          </Link>
        </div>

        {/* ✅ Hide menu + login button if on auth page */}
        {!isAuthPage && (
          <>
            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:gap-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative group flex items-center gap-2 px-6 py-2 mx-2 text-sm font-medium transition-all duration-300 rounded-lg ${
                    pathname === item.href
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <span
                    className={`transition-colors ${
                      pathname === item.href
                        ? 'text-blue-600'
                        : 'text-gray-400 group-hover:text-blue-600'
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Login Button */}
            <div className="hidden lg:flex lg:flex-1 lg:justify-end">
              <Link
                href="/login"
                className="group flex items-center gap-3 bg-[#1976D2] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <UserCircleIcon className="w-5 h-5" />
                Log in
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="-m-2.5 inline-flex items-center justify-center rounded-lg p-2.5 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>
          </>
        )}
      </nav>
    </header>
  )
}
