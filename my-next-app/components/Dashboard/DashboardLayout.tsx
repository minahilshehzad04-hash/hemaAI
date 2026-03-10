'use client'

import { ReactNode, useState, useEffect, useMemo, useCallback, memo } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  User,
  Calendar,
  BarChart3,
  Video,
  LogOut,
  UserCheck,
  FileText,
  Activity,
  Stethoscope,
  Heart,
  Droplet,
  Settings,
  Clock
} from 'lucide-react'
import  NotificationBell from '@/components/Consultation/NotificationBell' // ✅ Named import
import { cn, getInitials } from '@/lib/utils'

const supabase = createClient()

interface DashboardLayoutProps {
  userType: 'patient' | 'doctor' | 'donor'
  user: any
  userProfile: any
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
  children: ReactNode
  unreadCount?: number
  userId?: string | null
  profileImageError?: boolean
  onProfileImageError?: () => void
}

function DashboardLayoutComponent({
  userType,
  user,
  userProfile,
  activeTab,
  onTabChange,
  onLogout,
  children,
  unreadCount = 0,
  userId,
  profileImageError = false,
  onProfileImageError
}: DashboardLayoutProps) {
  console.log('🏠 DashboardLayout RENDERED, userId:', userId?.substring(0, 8))
  
  const isDoctor = userType === 'doctor'
  const isDonor = userType === 'donor'
  
  // ✅ MEMOIZE EVERYTHING
  const navItems = useMemo(() => {
    if (isDoctor) {
      return [
        { id: 'overview', name: 'Overview', icon: BarChart3 },
        { id: 'consultations', name: 'Consultation', icon: Video },
        { id: 'blood-smear', name: 'Blood Smear', icon: Activity },
        { id: 'reports', name: 'Reports', icon: FileText },
        { id: 'profile', name: 'Profile', icon: UserCheck },
      ]
    }
    if (isDonor) {
      return [
        { id: 'overview', name: 'Overview', icon: BarChart3 },
        { id: 'profile', name: 'Profile', icon: User },
        { id: 'donations', name: 'My Donations', icon: Clock },
      ]
    }
    return [
      { id: 'overview', name: 'Overview', icon: BarChart3 },
      { id: 'consultations', name: 'Consultations', icon: Calendar },
      { id: 'symptoms', name: 'Symptoms', icon: Activity },
      { id: 'records', name: 'Records', icon: FileText },
      { id: 'find-donors', name: 'Find Donors', icon: Heart },
      { id: 'profile', name: 'Profile', icon: User },
    ]
  }, [isDoctor, isDonor])

  // ✅ Profile image URL processing
  const profilePictureUrl = useMemo(() => {
    if (!userProfile?.profile_picture_url || profileImageError) {
      return null
    }
    
    const url = userProfile.profile_picture_url
    if (url.startsWith('data:image/') || url.startsWith('http')) {
      return url
    }
    
    if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.webp')) {
      try {
        const { data } = supabase.storage.from('avatars').getPublicUrl(url)
        return data.publicUrl
      } catch {
        return null
      }
    }
    
    return null
  }, [userProfile?.profile_picture_url, profileImageError])

  // ✅ Profile picture rendering
  const renderProfilePicture = useMemo(() => {
    if (!profilePictureUrl) {
      const initials = getInitials(user?.full_name || (isDoctor ? 'Doctor' : isDonor ? 'Donor' : 'Patient'))
      return (
        <span className="flex items-center justify-center w-full h-full text-white font-semibold">
          {initials}
        </span>
      )
    }
    
    return (
      <img
        src={profilePictureUrl}
        alt={isDoctor ? `Dr. ${user?.full_name}` : user?.full_name}
        className="w-full h-full object-cover"
        loading="lazy"
        decoding="async"
        width={40}
        height={40}
        onError={onProfileImageError}
      />
    )
  }, [profilePictureUrl, user, isDoctor, isDonor, onProfileImageError])

  // ✅ Handle tab change
  const handleTabChange = useCallback((tab: string) => {
    onTabChange(tab)
  }, [onTabChange])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-2 rounded-xl shadow-lg",
                isDoctor ? "bg-blue-600" : isDonor ? "bg-blue-600" : "bg-blue-600"
              )}>
                {isDoctor ? (
                  <Stethoscope className="w-7 h-7 text-white" />
                ) : isDonor ? (
                  <Droplet className="w-7 h-7 text-white fill-current" />
                ) : (
                  <User className="w-7 h-7 text-white" />
                )}
              </div>
              <div>
                <h1 className={cn(
                  "text-2xl font-bold bg-clip-text text-transparent",
                  isDonor ? "bg-gradient-to-r from-blue-600 to-blue-800" : "bg-gradient-to-r from-blue-600 to-blue-800"
                )}>
                  HemaAI {isDoctor ? 'Doctor' : isDonor ? 'Donor' : 'Patient'} Portal
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome, {isDoctor ? 'Dr.' : ''} {user?.full_name || (isDoctor ? 'Doctor' : isDonor ? 'Donor' : 'Patient')}
                  {userProfile?.specialization && (
                    <span className="ml-2 text-blue-600">• {userProfile.specialization}</span>
                  )}
                  {userProfile?.blood_group && isDonor && (
                    <span className="ml-2 text-blue-600 font-semibold text-xs bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">{userProfile.blood_group}</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* ✅ NOTIFICATION BELL WITH KEY PROP */}
              <NotificationBell 
                key={`notification-${userId}`} // ✅ CRITICAL: Forces clean remount
                userId={userId ?? null} 
                userType={userType}
              />

              <button
                onClick={() => handleTabChange('profile')}
                className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg overflow-hidden",
                  isDoctor ? "bg-blue-600" : isDonor ? "bg-blue-600" : "bg-purple-600"
                )}>
                  {renderProfilePicture}
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {isDoctor ? 'Dr.' : ''} {user?.full_name || (isDoctor ? 'Doctor' : isDonor ? 'Donor' : 'Patient')}
                  </p>
                  <p className="text-xs text-gray-600">
                    {isDoctor 
                      ? (userProfile?.specialization || 'Medical Professional')
                      : isDonor ? 'Blood Donor' : 'Patient'
                    }
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-2">
            <nav className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-sm border border-gray-200/60 p-2 sticky top-24">
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200",
                        activeTab === item.id
                          ? (isDonor ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600 font-semibold" : "bg-blue-600 text-white shadow-md")
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium truncate">{item.name}</span>
                    </button>
                  )
                })}
              </div>

              <div className="border-t border-gray-200 my-3"></div>

              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm">Logout</span>
              </button>
            </nav>
          </div>

          <div className="lg:col-span-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// ✅ EXPORT MEMOIZED LAYOUT
export const DashboardLayout = memo(DashboardLayoutComponent)