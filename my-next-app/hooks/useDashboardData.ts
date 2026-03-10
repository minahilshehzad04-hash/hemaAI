'use client'

import { useState, useCallback, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getConsultationStatusText } from '@/lib/utils'

const supabase = createClient()

// Cache for profiles to avoid duplicate requests
const profileCache = new Map<string, any>()

export function useDashboardData(userType: 'patient' | 'doctor' | 'donor') {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [consultations, setConsultations] = useState<any[]>([])
  const [todayConsultations, setTodayConsultations] = useState<any[]>([])
  const [pendingConsultations, setPendingConsultations] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [profileImageError, setProfileImageError] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const subscriptionRef = useRef<any>(null)
  const mountedRef = useRef(true)

  // Memoized fetch profile with caching
  const fetchProfile = useCallback(async (userId: string) => {
    const cacheKey = `${userType}_${userId}`
    
    // Check cache first
    if (profileCache.has(cacheKey)) {
      return profileCache.get(cacheKey)
    }

    try {
      // Parallel fetch for better performance
      const [profileRes, specificProfileRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, profile_picture_url, is_active')
          .eq('id', userId)
          .single(),
        userType === 'doctor'
          ? supabase
              .from('doctor_profiles')
              .select('specialization, qualifications, profile_picture_url')
              .eq('user_id', userId)
              .maybeSingle()
          : userType === 'donor'
          ? supabase
              .from('donor_profiles')
              .select('blood_group, availability, city, profile_picture_url, contact_number')
              .eq('user_id', userId)
              .maybeSingle()
          : supabase
              .from('patient_profiles')
              .select('gender, dob, blood_group, profile_picture_url')
              .eq('patient_id', userId)
              .maybeSingle()
      ])

      if (profileRes.error) throw profileRes.error

      const combinedProfile = {
        ...profileRes.data,
        ...specificProfileRes.data,
        profile_picture_url: specificProfileRes.data?.profile_picture_url || 
                            profileRes.data?.profile_picture_url
      }

      // Cache the result
      profileCache.set(cacheKey, combinedProfile)
      
      return combinedProfile
    } catch (error) {
      console.error('Error fetching profile:', error)
      throw error
    }
  }, [userType])

  // Optimized consultations fetch with batch processing
  const fetchConsultations = useCallback(async (userId: string, userType: 'patient' | 'doctor' | 'donor') => {
    // Note: Donors might not have consultations in the same way, but keeping signature for now
    if (userType === 'donor') return []
    
    try {
      // Build query
      let query = supabase
        .from('consultations')
        .select('id, patient_id, doctor_id, status, scheduled_time, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(50) // Increased limit for better batch processing

      if (userType === 'doctor') {
        query = query.eq('doctor_id', userId)
      } else {
        query = query.eq('patient_id', userId)
      }

      const { data: consultationsData, error } = await query

      if (error) throw error
      if (!consultationsData || consultationsData.length === 0) return []

      // Extract unique user IDs
      const patientIds = [...new Set(consultationsData.map(c => c.patient_id).filter(Boolean))]
      const doctorIds = [...new Set(consultationsData.map(c => c.doctor_id).filter(Boolean))]

      // Batch fetch user profiles
      const [patientsRes, doctorsRes] = await Promise.all([
        patientIds.length > 0 
          ? supabase
              .from('profiles')
              .select('id, full_name, profile_picture_url')
              .in('id', patientIds)
          : Promise.resolve({ data: [] }),
        doctorIds.length > 0
          ? supabase
              .from('profiles')
              .select('id, full_name, profile_picture_url')
              .in('id', doctorIds)
          : Promise.resolve({ data: [] })
      ])

      // Create lookup maps
      const patientsMap = new Map(patientsRes.data?.map(p => [p.id, p]) || [])
      const doctorsMap = new Map(doctorsRes.data?.map(d => [d.id, d]) || [])

      // Enhance consultations with profile data
      return consultationsData.map(consultation => ({
        ...consultation,
        patient: patientsMap.get(consultation.patient_id) || null,
        doctor: doctorsMap.get(consultation.doctor_id) || null
      }))
    } catch (error) {
      console.error('Error fetching consultations:', error)
      return []
    }
  }, [])

  // Process consultations data
  const processConsultationsData = useCallback((consultationsData: any[]) => {
    const now = new Date()
    const todayStart = new Date(now.setHours(0, 0, 0, 0))
    const todayEnd = new Date(now.setHours(23, 59, 59, 999))

    // Use for loops instead of filter for better performance with large datasets
    const pending = []
    const todayConsults = []
    
    for (const consultation of consultationsData) {
      if (consultation.status === 'pending') {
        pending.push(consultation)
      }
      
      const consultDate = new Date(consultation.scheduled_time || consultation.created_at)
      const isToday = consultDate >= todayStart && consultDate <= todayEnd
      
      if (isToday && ['accepted', 'rescheduled', 'pending'].includes(consultation.status)) {
        todayConsults.push(consultation)
      }
    }

    setPendingConsultations(pending)
    setTodayConsultations(todayConsults)
    setConsultations(consultationsData)

    // Generate recent activities (limited to 4)
    const recent = todayConsults.slice(0, 4).map(consultation => ({
      id: consultation.id,
      type: 'consultation',
      title: userType === 'doctor' 
        ? `Consultation with ${consultation.patient?.full_name || 'Patient'}`
        : userType === 'donor'
        ? `Donation Update`
        : `Consultation with Dr. ${consultation.doctor?.full_name || 'Doctor'}`,
      description: getConsultationStatusText(consultation.status, userType),
      time: consultation.created_at,
      icon: consultation.status === 'completed' ? 'CheckCircle' :
            consultation.status === 'pending' ? 'Clock' :
            consultation.status === 'accepted' ? 'Calendar' : 'Video',
      color: consultation.status === 'completed' ? 'green' :
             consultation.status === 'pending' ? 'yellow' :
             consultation.status === 'accepted' ? 'blue' : 'purple'
    }))
    
    setRecentActivities(recent)
  }, [userType])

  // Memoized unread count fetch
  const fetchUnreadCount = useCallback(async (userId: string) => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (!error && count !== null) {
        setUnreadCount(count)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }, [])

  // Main data fetch function
  const fetchData = useCallback(async (userId: string) => {
    if (!mountedRef.current) return
    
    setLoading(true)
    
    try {
      // Parallel fetch for better performance
      const [profile, consultationsData] = await Promise.all([
        fetchProfile(userId),
        fetchConsultations(userId, userType)
      ])

      if (!profile?.is_active && profile?.is_active !== undefined) {
        throw new Error('Account is deactivated')
      }

      if (mountedRef.current) {
        setUser(profile)
        setUserProfile(profile)
        
        processConsultationsData(consultationsData)
        await fetchUnreadCount(userId)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      throw error
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [fetchProfile, fetchConsultations, userType, processConsultationsData, fetchUnreadCount])

  // Real-time subscription with cleanup
  const subscribeToNotifications = useCallback((userId: string) => {
    // Clean up existing subscription
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current)
    }

    subscriptionRef.current = supabase
      .channel(`dashboard-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        () => {
          // Debounce the refetch
          setTimeout(() => {
            if (mountedRef.current) {
              fetchUnreadCount(userId)
            }
          }, 500)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Dashboard subscribed to notifications')
        }
      })

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current)
        subscriptionRef.current = null
      }
    }
  }, [fetchUnreadCount])

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    mountedRef.current = false
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current)
      subscriptionRef.current = null
    }
  }, [])

  return useMemo(() => ({
    user,
    userProfile,
    loading,
    consultations,
    todayConsultations,
    pendingConsultations,
    userId,
    recentActivities,
    profileImageError,
    unreadCount,
    fetchData,
    setProfileImageError,
    setUserId,
    subscribeToNotifications,
    cleanup
  }), [
    user, userProfile, loading, consultations, todayConsultations,
    pendingConsultations, userId, recentActivities, profileImageError,
    unreadCount, fetchData
  ])
}