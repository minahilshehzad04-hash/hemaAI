'use client'

import { useState, useEffect, useCallback } from 'react'
import { createSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { 
  Clock, MessageCircle, Heart, Activity, AlertTriangle, 
  TrendingUp, Thermometer, Brain, Zap, Stethoscope
} from 'lucide-react'

import { DashboardLayout, DashboardLoading, StatsCard } from '@/components/Dashboard'
import { TodaySchedule, RecentActivities } from '@/components/Dashboard'
import Consultation from '../patient/Consultation/page'
import Profile from '../patient/Profile/page'
import Symptom from '@/components/Patient/Symptom'
import { useDashboardData } from '@/hooks/useDashboardData'
import SymptomHistory from '@/components/Patient/SymptomHistory'
import DonorSearch from '@/components/Patient/DonorSearch'
import Link from 'next/link'

const supabase = createSupabaseClient();

interface PatientStats {
  activeConsultations: number
  unreadMessages: number
  recentAssessments: number
  highRiskSymptoms: number
}

interface SymptomData {
  symptom_name: string
  formatted_name: string
  last_severity: number
  last_assessment_date: string
  trend: 'improving' | 'worsening' | 'stable'
}

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()
  
  const {
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
    subscribeToNotifications
  } = useDashboardData('patient')

  const [stats, setStats] = useState<PatientStats>({
    activeConsultations: 0,
    unreadMessages: 0,
    recentAssessments: 0,
    highRiskSymptoms: 0
  })

  const [recentSymptoms, setRecentSymptoms] = useState<SymptomData[]>([])
  const [currentRiskScore, setCurrentRiskScore] = useState<number | null>(null)
  const [topSymptoms, setTopSymptoms] = useState<string[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [symptomsLoading, setSymptomsLoading] = useState(false)

  // Fetch symptom-related data
  const fetchSymptomData = useCallback(async (patientId: string) => {
    try {
      setSymptomsLoading(true)
      
      // Fetch latest assessment
      const { data: assessments, error: assessmentError } = await supabase
        .from('leukemia_assessments')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1)

      if (assessmentError) throw assessmentError

      if (assessments && assessments.length > 0) {
        const latestAssessment = assessments[0]
        setCurrentRiskScore(latestAssessment.risk_score)

        // Extract top 3 symptoms by severity
        const symptomEntries = Object.entries(latestAssessment.symptoms || {})
          .filter(([_, severity]) => (severity as number) > 0)
          .sort((a, b) => (b[1] as number) - (a[1] as number)) // Sort by severity descending
          .slice(0, 3)
          .map(([key]) => key.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '))

        setTopSymptoms(symptomEntries)

        // Count high severity symptoms (severity >= 2)
        const highSeverityCount = Object.values(latestAssessment.symptoms || {})
          .filter(severity => (severity as number) >= 2).length
        
        setStats(prev => ({
          ...prev,
          highRiskSymptoms: highSeverityCount
        }))
      }

      // Fetch recent symptoms trend (last 3 assessments)
      const { data: recentAssessments, error: recentError } = await supabase
        .from('leukemia_assessments')
        .select('symptoms, created_at')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(3)

      if (recentError) throw recentError

      if (recentAssessments && recentAssessments.length > 0) {
        const recentSymptomData: SymptomData[] = []
        
        // Get symptoms from latest assessment
        const latestSymptoms = recentAssessments[0]?.symptoms || {}
        
        Object.entries(latestSymptoms).forEach(([symptom, severity]) => {
          if ((severity as number) > 0) {
            // Check trend by comparing with previous assessment
            let trend: 'improving' | 'worsening' | 'stable' = 'stable'
            
            if (recentAssessments.length >= 2) {
              const previousSeverity = recentAssessments[1]?.symptoms?.[symptom] || 0
              if ((severity as number) > previousSeverity) trend = 'worsening'
              else if ((severity as number) < previousSeverity) trend = 'improving'
            }

            recentSymptomData.push({
              symptom_name: symptom,
              formatted_name: symptom.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' '),
              last_severity: severity as number,
              last_assessment_date: recentAssessments[0].created_at,
              trend
            })
          }
        })

        // Sort by severity and take top 3
        recentSymptomData.sort((a, b) => b.last_severity - a.last_severity)
        setRecentSymptoms(recentSymptomData.slice(0, 3))

        setStats(prev => ({
          ...prev,
          recentAssessments: recentAssessments.length
        }))
      }
    } catch (error) {
      console.error('Error fetching symptom data:', error)
    } finally {
      setSymptomsLoading(false)
    }
  }, [])

  // Fetch initial user data
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

  // Initialize dashboard
  const initializeDashboard = useCallback(async () => {
    try {
      const authUser = await fetchInitialUser()
      if (!authUser) return

      setUserId(authUser.id)
      
      // Fetch dashboard data
      await fetchData(authUser.id)
      
      // Fetch symptom data
      await fetchSymptomData(authUser.id)
      
      // Set up real-time subscription
      const cleanup = subscribeToNotifications(authUser.id)
      
      setIsInitialized(true)
      
      return cleanup
    } catch (error: any) {
      console.error('Dashboard initialization error:', error)
      
      // Handle specific errors
      if (error.message === 'Account is deactivated') {
        toast.error('⚠️ Your account is deactivated.')
        await supabase.auth.signOut()
        router.push('/')
      } else if (error.code === 'PGRST200') {
        // Handle foreign key relationship errors gracefully
        console.warn('Foreign key relationship error, continuing with partial data')
        toast.error('Some data may be incomplete due to database configuration')
      } else {
        toast.error('Failed to load dashboard data. Please try again.')
      }
    }
  }, [fetchInitialUser, fetchData, router, setUserId, subscribeToNotifications, fetchSymptomData])

  // Initialize on mount
  useEffect(() => {
    let cleanup: (() => void) | undefined

    const init = async () => {
      if (!isInitialized) {
        cleanup = await initializeDashboard()
      }
    }

    init()

    return () => {
      if (cleanup) cleanup()
    }
  }, [initializeDashboard, isInitialized])

  // Calculate patient statistics
  useEffect(() => {
    if (consultations.length > 0) {
      const activeConsultations = consultations.filter(c => 
        ['accepted', 'pending'].includes(c.status)
      ).length

      setStats(prev => ({
        ...prev,
        activeConsultations,
        unreadMessages: unreadCount
      }))
    }
  }, [consultations, unreadCount])

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('Logged out successfully')
      router.push('/')
    } catch (error) {
      toast.error('Failed to log out')
      console.error('Logout error:', error)
    }
  }

  const handleStartChat = (consultation: any) => {
    console.log('Start chat with:', consultation)
    // Implement your chat logic here
  }

  if (loading && !isInitialized) {
    return <DashboardLoading userType="patient" />
  }

  return (
    <DashboardLayout
      userType="patient"
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
      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Health Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Active Consultations"
              value={stats.activeConsultations}
              change={`${consultations.filter(c => c.status === 'pending').length} pending`}
              trend={stats.activeConsultations > 0 ? 'up' : 'neutral'}
              icon={Clock}
              color="blue"
              loading={loading}
            />
            <StatsCard
              title="Unread Messages"
              value={stats.unreadMessages}
              change="From doctors & support"
              trend={stats.unreadMessages > 0 ? 'up' : 'neutral'}
              icon={MessageCircle}
              color="green"
              loading={loading}
            />
            <StatsCard
              title="Recent Assessments"
              value={stats.recentAssessments}
              change={`${stats.highRiskSymptoms} high-severity symptoms`}
              trend={stats.recentAssessments > 0 ? 'up' : 'neutral'}
              icon={Activity}
              color="purple"
              loading={symptomsLoading}
            />
            <StatsCard
              title="Symptom Severity"
              value={stats.highRiskSymptoms}
              change="Symptoms requiring attention"
              trend={stats.highRiskSymptoms > 0 ? 'up' : 'neutral'}
              icon={AlertTriangle}
              color={stats.highRiskSymptoms > 0 ? 'red' : 'yellow'}
              loading={symptomsLoading}
            />
          </div>

          {/* Additional Overview Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Today's Schedule */}
            <div className="xl:col-span-2">
              <TodaySchedule
                consultations={todayConsultations}
                userType="patient"
                onStartChat={handleStartChat}
                loading={loading}
              />
            </div>

            {/* Recent Activities */}
            <div className="xl:col-span-1">
              <RecentActivities
                activities={recentActivities}
                loading={loading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Other Tabs */}
      {activeTab === 'consultations' && (
        <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 p-6">
          <Consultation />
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 p-6">
          <Profile />
        </div>
      )}

      {activeTab === 'records' && (
        <SymptomHistory userId={userId ?? ''} />
      )}

      {activeTab === 'find-donors' && (
        <DonorSearch />
      )}

      {activeTab === 'symptoms' && (
        <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 p-6">
          <Symptom />
        </div>
      )}
    </DashboardLayout>
  )
}