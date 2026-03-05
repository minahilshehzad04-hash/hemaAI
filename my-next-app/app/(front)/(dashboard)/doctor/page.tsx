'use client'

import React from 'react'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { createSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { 
  Users, Clock, Activity, AlertCircle, 
  Heart, TestTube, CheckCircle 
} from 'lucide-react'

import { DashboardLayout, DashboardLoading, StatsCard } from '@/components/Dashboard'
import { TodaySchedule, RecentActivities } from '@/components/Dashboard'
import Consultation from '../doctor/Consultation/page'
import Profile from '../doctor/Profile/page'
import BloodSmearDiagnosis from '@/components/Doctor/BloodSmearDiagnosis'
import MedicalReports from '@/components/Doctor/MedicalReports'
import { useDashboardData } from '@/hooks/useDashboardData'

const supabase = createSupabaseClient();

interface DashboardStats {
  todayAppointments: number
  pendingApprovals: number
  bloodAnalysis: number
  completedToday: number
  mmCases: number
  leukemiaCases: number
  lymphomaCases: number
  normalCases: number
}

// Memoized stats calculator
const calculateStats = (
  todayConsultations: any[], 
  pendingConsultations: any[], 
  bloodStats: any
): DashboardStats => {
  const completedToday = todayConsultations.filter(c => c.status === 'completed').length
  
  return {
    todayAppointments: todayConsultations.length,
    pendingApprovals: pendingConsultations.length,
    bloodAnalysis: bloodStats.totalReports || 0,
    completedToday,
    mmCases: bloodStats.mmCases || 0,
    leukemiaCases: bloodStats.leukemiaCases || 0,
    lymphomaCases: bloodStats.lymphomaCases || 0,
    normalCases: bloodStats.normalCases || 0
  }
}

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()
  
  const {
    user,
    userProfile,
    loading,
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
  } = useDashboardData('doctor')

  const [bloodStats, setBloodStats] = useState({
    totalReports: 0,
    mmCases: 0,
    leukemiaCases: 0,
    normalCases: 0,
    lymphomaCases: 0
  })

  const [isInitialized, setIsInitialized] = useState(false)
  const [authUser, setAuthUser] = useState<any>(null)

  // Fetch initial user data - memoized
  const fetchInitialUser = useCallback(async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !authUser) {
        toast.error('Please log in to access dashboard')
        router.push('/login')
        return null
      }

      return authUser
    } catch (error) {
      console.error('Error fetching user:', error)
      toast.error('Failed to authenticate')
      router.push('/login')
      return null
    }
  }, [router])

  // Fetch blood statistics with caching
  const fetchBloodStats = useCallback(async (doctorId: string) => {
    if (!doctorId) return

    try {
      // Use count query instead of fetching all data
      const { data, error } = await supabase
        .from('blood_smear_diagnoses')
        .select('diagnosis')
        .eq('doctor_id', doctorId)
        .limit(100) // Limit to prevent large data transfer

      if (error) throw error

      const stats = {
        totalReports: data?.length || 0,
        mmCases: 0,
        leukemiaCases: 0,
        lymphomaCases: 0,
        normalCases: 0
      }

      // Process in batches to avoid blocking UI
      const batchSize = 50
      for (let i = 0; i < (data?.length || 0); i += batchSize) {
        const batch = data?.slice(i, i + batchSize) || []
        batch.forEach(d => {
          const diag = (d.diagnosis || '').toLowerCase()
          if (diag.includes('myeloma')) stats.mmCases++
          else if (diag.includes('leukemia')) stats.leukemiaCases++
          else if (diag.includes('lymphoma')) stats.lymphomaCases++
          else if (diag.includes('normal')) stats.normalCases++
        })
      }

      setBloodStats(stats)
    } catch (error) {
      console.error('Error fetching blood stats:', error)
    }
  }, [])

  // Initialize dashboard - memoized
  const initializeDashboard = useCallback(async () => {
    try {
      const userData = await fetchInitialUser()
      if (!userData) return

      setAuthUser(userData)
      setUserId(userData.id)
      
      // Parallel initialization
      await Promise.all([
        fetchData(userData.id),
        fetchBloodStats(userData.id)
      ])
      
      // Set up real-time subscription
      subscribeToNotifications(userData.id)
      
      setIsInitialized(true)
    } catch (error: any) {
      console.error('Dashboard initialization error:', error)
      
      if (error.message === 'Account is deactivated') {
        toast.error('⚠️ Your account is deactivated.')
        await supabase.auth.signOut()
        router.push('/')
      } else {
        toast.error('Failed to load dashboard data')
      }
    }
  }, [fetchInitialUser, fetchData, fetchBloodStats, router, setUserId, subscribeToNotifications])

  // Initialize on mount
  useEffect(() => {
    if (isInitialized) return

    initializeDashboard()

    return () => {
      cleanup()
    }
  }, [initializeDashboard, isInitialized, cleanup])

  // Memoized stats calculation
  const stats = useMemo(() => 
    calculateStats(todayConsultations, pendingConsultations, bloodStats),
    [todayConsultations, pendingConsultations, bloodStats]
  )

  // Memoized handle logout
  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Logged out successfully')
      router.push('/')
    } catch (error) {
      toast.error('Failed to log out')
    }
  }, [router])

  // Memoized handle card click
  const handleCardClick = useCallback((tab: string) => {
    setActiveTab(tab)
  }, [])

  if (loading && !isInitialized) {
    return <DashboardLoading userType="doctor" />
  }

  return (
    <DashboardLayout
      userType="doctor"
      user={user}
      userProfile={userProfile}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
      unreadCount={unreadCount}
      userId={userId}
      profileImageError={profileImageError}
      onProfileImageError={() => setProfileImageError(true)}
    >
      {activeTab === 'overview' && (
        <DashboardOverview
          stats={stats}
          loading={loading}
          todayConsultations={todayConsultations}
          recentActivities={recentActivities}
          onCardClick={handleCardClick}
        />
      )}
      
      {activeTab === 'consultations' && <Consultation />}
      {activeTab === 'blood-smear' && <BloodSmearDiagnosis />}
      {activeTab === 'profile' && <Profile />}
      {activeTab === 'reports' && <MedicalReports />}
    </DashboardLayout>
  )
}

// Separate DashboardOverview component for better performance
const DashboardOverview = React.memo(({ 
  stats, 
  loading, 
  todayConsultations, 
  recentActivities, 
  onCardClick 
}: any) => (
  <div className="space-y-6 animate-fade-in">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatsCard
        title="Today Appointments"
        value={stats.todayAppointments}
        change={`${stats.completedToday} completed`}
        trend={stats.todayAppointments > 0 ? 'up' : 'neutral'}
        icon={Users}
        color="blue"
        loading={loading}
      />
      <StatsCard
        title="Pending Approvals"
        value={stats.pendingApprovals}
        change="Consultation requests"
        trend={stats.pendingApprovals > 0 ? 'up' : 'neutral'}
        icon={Clock}
        color="yellow"
        onClick={() => onCardClick('consultations')}
        loading={loading}
      />
      <StatsCard
        title="Blood Analysis"
        value={stats.bloodAnalysis}
        change="Total reports generated"
        trend={stats.bloodAnalysis > 0 ? 'up' : 'neutral'}
        icon={Activity}
        color="purple"
        onClick={() => onCardClick('blood-smear')}
        loading={loading}
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatsCard
        title="MM Detected"
        value={stats.mmCases}
        change="Multiple Myeloma"
        trend={stats.mmCases > 0 ? 'up' : 'neutral'}
        icon={AlertCircle}
        color="red"
        onClick={() => onCardClick('reports')}
        loading={loading}
      />
      <StatsCard
        title="Leukemia Cases"
        value={stats.leukemiaCases}
        change="Leukemia detections"
        trend={stats.leukemiaCases > 0 ? 'up' : 'neutral'}
        icon={Heart}
        color="orange"
        onClick={() => onCardClick('reports')}
        loading={loading}
      />
      <StatsCard
        title="Lymphoma Cases"
        value={stats.lymphomaCases}
        change="Lymphoma detections"
        trend={stats.lymphomaCases > 0 ? 'up' : 'neutral'}
        icon={TestTube}
        color="indigo"
        onClick={() => onCardClick('reports')}
        loading={loading}
      />
      <StatsCard
        title="Normal Results"
        value={stats.normalCases}
        change="Healthy reports"
        trend={stats.normalCases > 0 ? 'up' : 'neutral'}
        icon={CheckCircle}
        color="green"
        onClick={() => onCardClick('reports')}
        loading={loading}
      />
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2">
        <TodaySchedule
          consultations={todayConsultations}
          userType="doctor"
          loading={loading}
        />
      </div>
      <div className="xl:col-span-1">
        <RecentActivities
          activities={recentActivities}
          loading={loading}
        />
      </div>
    </div>
  </div>
))