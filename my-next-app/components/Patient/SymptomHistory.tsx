// components/Patient/SymptomHistory.tsx - UPDATED VERSION
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Activity,
  Calendar,
  Filter,
  Download,
  BarChart3,
  Clock,
  Thermometer,
  Heart,
  Brain,
  Stethoscope,
  AlertCircle,
  Zap,
  Shield,
  CloudRain,
  Users,
  Droplets,
  Coffee,
  Eye,
  Flame,
  ArrowRight,
  ClipboardCheck,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

const supabase = createClient()

interface SymptomRecord {
  id: string
  created_at: string
  symptoms: {
    [key: string]: number  // Binary: 0 or 1
  }
  risk_score: number
  risk_level: 'Low' | 'Medium' | 'High'
  analysis_mode: string
  model_used: string
  doctor_comments?: string
  recommendations: string[]
  next_steps: string[]
  patient_id: string
}

interface SymptomTrend {
  symptom_name: string
  formatted_name: string
  presence_history: number[]  // Binary history: 0 or 1
  dates: string[]
  trend: 'improving' | 'worsening' | 'stable'
  frequency: number  // Percentage of times present (0-100)
  last_present: boolean
}

export default function SymptomHistory({ userId }: { userId: string }) {
  const [records, setRecords] = useState<SymptomRecord[]>([])
  const [trends, setTrends] = useState<SymptomTrend[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'week' | 'month' | 'year'>('month')
  const [selectedSymptom, setSelectedSymptom] = useState<string>('all')
  const [hasData, setHasData] = useState(false)

  // Binary labels (0/1)
  const presenceLabels = ['Not Present', 'Present']
  const riskColors = {
    Low: 'text-green-600 bg-green-50 border-green-200',
    Medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    High: 'text-red-600 bg-red-50 border-red-200'
  }

  const getSymptomIcon = (symptomKey: string) => {
    const icons: { [key: string]: any } = {
      shortness_of_breath: Activity,
      bone_pain: Heart,
      fever: Thermometer,
      frequent_infections: Shield,
      Persistent_weakness_and_fatigue: Zap,  // Note: Capital P
      significant_bruising_bleeding: AlertCircle,
      night_sweats: CloudRain,
      family_history: Users,
      jaundice: AlertTriangle,
      Itchy_skin_or_rash: Droplets,  // Note: Capital I
      loss_of_appetite_or_nausea: Coffee,
      swollen_painless_lymph: Shield,
      enlarged_liver: AlertTriangle,
      oral_cavity: Heart,
      vision_blurring: Eye,
      smokes: Flame,
    }
    return icons[symptomKey] || AlertTriangle
  }

  const formatSymptomName = (key: string) => {
    return key.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const fetchSymptomHistory = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching symptom history for user ID:', userId)

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please login to view symptom history')
        return
      }

      // Query by patient_id
      const { data, error, count } = await supabase
        .from('leukemia_assessments')
        .select('*', { count: 'exact' })
        .eq('patient_id', userId)
        .order('created_at', { ascending: false })

      console.log('📊 Query results:', { data, error, count, userId })

      if (error) {
        console.error('❌ Database error:', error)
        throw error
      }

      if (!data || data.length === 0) {
        console.log('📭 No records found for patient_id:', userId)
        setHasData(false)
        setRecords([])
        setTrends([])
        toast.success('No assessments found. Complete your first assessment to see history.')
      } else {
        console.log('✅ Found records:', data.length)
        setHasData(true)
        setRecords(data)
        analyzeTrends(data)
        toast.success(`Found ${data.length} assessment records`)
      }
    } catch (error: any) {
      console.error('❌ Error fetching symptom history:', error)

      // If table doesn't exist, show empty state
      if (error.code === '42P01') { // PostgreSQL table doesn't exist error
        toast.error('Assessment history feature not available yet')
      } else {
        toast.error(`Failed to load history: ${error.message}`)
      }

      setHasData(false)
      setRecords([])
      setTrends([])
    } finally {
      setLoading(false)
    }
  }

  const analyzeTrends = (records: SymptomRecord[]) => {
    if (records.length === 0) {
      setTrends([])
      return
    }

    // Extract all unique symptoms across records
    const allSymptoms = new Map<string, {
      presence_history: number[],
      dates: string[],
      formatted_name: string
    }>()

    // Process each record
    records.forEach(record => {
      const recordDate = new Date(record.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })

      Object.entries(record.symptoms || {}).forEach(([symptom, presence]) => {
        if (!allSymptoms.has(symptom)) {
          allSymptoms.set(symptom, {
            presence_history: [],
            dates: [],
            formatted_name: formatSymptomName(symptom)
          })
        }

        const symptomData = allSymptoms.get(symptom)!
        symptomData.presence_history.push(presence) // Binary: 0 or 1
        symptomData.dates.push(recordDate)
      })
    })

    // Convert to trend objects
    const symptomTrends: SymptomTrend[] = Array.from(allSymptoms.entries()).map(([symptom, data]) => {
      const { presence_history, dates, formatted_name } = data

      // Calculate trend for binary data
      let trend: 'improving' | 'worsening' | 'stable' = 'stable'
      if (presence_history.length >= 2) {
        const first = presence_history[0]
        const last = presence_history[presence_history.length - 1]
        if (last < first) trend = 'improving' // 1 → 0 means improving
        else if (last > first) trend = 'worsening' // 0 → 1 means worsening
      }

      // Calculate frequency (percentage of times present)
      const frequency = (presence_history.filter(v => v === 1).length / presence_history.length) * 100

      return {
        symptom_name: symptom,
        formatted_name,
        presence_history,
        dates,
        trend,
        frequency: Math.round(frequency),
        last_present: presence_history[presence_history.length - 1] === 1
      }
    })

    // Sort by frequency (highest first)
    symptomTrends.sort((a, b) => b.frequency - a.frequency)

    setTrends(symptomTrends)
  }

  const getTrendIcon = (trend: string, lastPresent: boolean) => {
    switch (trend) {
      case 'improving':
        return <TrendingDown className="w-4 h-4 text-green-600" />
      case 'worsening':
        return <TrendingUp className="w-4 h-4 text-red-600" />
      default:
        return lastPresent ? 
          <CheckCircle className="w-4 h-4 text-yellow-600" /> : 
          <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getPresenceColor = (present: boolean) => {
    return present ? 'bg-red-400' : 'bg-gray-300'
  }

  const getPresenceText = (present: boolean) => {
    return present ? 'Present' : 'Not Present'
  }

  const exportData = () => {
    if (records.length === 0) {
      toast.error('No data to export')
      return
    }

    const exportData = {
      patient_id: userId,
      export_date: new Date().toISOString(),
      total_assessments: records.length,
      symptom_trends: trends,
      assessment_history: records.map(record => ({
        date: record.created_at,
        risk_score: record.risk_score,
        risk_level: record.risk_level,
        analysis_mode: record.analysis_mode,
        model_used: record.model_used,
        symptoms: record.symptoms,
        recommendations: record.recommendations,
        next_steps: record.next_steps
      }))
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leukemia_symptom_history_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Symptom history exported successfully')
  }

  const getFilteredRecords = () => {
    const now = new Date()
    let cutoffDate = new Date()

    switch (selectedFilter) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
      case 'all':
      default:
        return records
    }

    return records.filter(record => new Date(record.created_at) >= cutoffDate)
  }

  useEffect(() => {
    if (userId) {
      fetchSymptomHistory()
    }
  }, [userId])

  const filteredRecords = getFilteredRecords()

  // Add this function to format date nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  // Add this function to get top symptoms for display
  const getTopSymptoms = (symptoms: { [key: string]: number }) => {
    return Object.entries(symptoms)
      .filter(([_, present]) => present === 1)
      .map(([symptom]) => formatSymptomName(symptom))
      .slice(0, 3) // Get top 3
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading symptom history...</p>
        </div>
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl shadow-blue-500/5">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 animate-blueShift rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/25">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#1976D2]">
                  Symptom History
                </h1>
                <p className="text-gray-600 text-lg mt-1 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-red-500" />
                  Track and analyze your symptom patterns over time
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-700/30">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center">
              <Stethoscope className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              No Assessment History Yet
            </h3>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Complete your first leukemia risk assessment to start tracking your symptoms and see detailed trends over time.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard/patient/symptoms"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <ClipboardCheck className="w-5 h-5" />
                Go to Symptoms Assessment
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={fetchSymptomHistory}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200"
              >
                <Activity className="w-5 h-5" />
                Refresh History
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl shadow-blue-500/5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 animate-blueShift rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/25">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-4 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1976D2]">
                Symptom History
              </h1>
              <p className="text-gray-600 text-lg mt-1 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-red-500" />
                Track and analyze your symptom patterns over time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {trends.length > 0 && (
          <select
            value={selectedSymptom}
            onChange={(e) => setSelectedSymptom(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white flex-1 max-w-xs"
          >
            <option value="all">All Symptoms</option>
            {trends.map(trend => (
              <option key={trend.symptom_name} value={trend.symptom_name}>
                {trend.formatted_name}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={fetchSymptomHistory}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700"
        >
          <Activity className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Assessments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredRecords.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Symptoms</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {trends.filter(t => t.last_present).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Risk</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredRecords.length > 0
                  ? Math.round(filteredRecords.reduce((sum, r) => sum + r.risk_score, 0) / filteredRecords.length) + '%'
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Symptom Trends */}
      {trends.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Symptom Frequency & Trends
          </h3>

          <div className="space-y-4">
            {trends
              .filter(trend => selectedSymptom === 'all' || trend.symptom_name === selectedSymptom)
              .slice(0, 5) // Show only top 5 symptoms
              .map((trend, index) => {
                const Icon = getSymptomIcon(trend.symptom_name)
                return (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{trend.formatted_name}</h4>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(trend.trend, trend.last_present)}
                            <span className={`text-sm ${trend.trend === 'improving' ? 'text-green-600 dark:text-green-400' :
                              trend.trend === 'worsening' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
                              }`}>
                              {trend.trend === 'stable' ? 
                                (trend.last_present ? 'Persistent' : 'Absent') : 
                                trend.trend.charAt(0).toUpperCase() + trend.trend.slice(1)}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              (Present {trend.frequency}% of assessments)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Current Status</p>
                        <p className={`text-lg font-bold ${trend.last_present ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          {trend.last_present ? 'Present' : 'Absent'}
                        </p>
                      </div>
                    </div>

                    {/* Mini Chart - Binary presence */}
                    <div className="flex items-center h-8 gap-1 mt-2">
                      {trend.presence_history.slice(-10).map((present, idx) => (
                        <div
                          key={idx}
                          className={`flex-1 h-4 rounded ${getPresenceColor(present === 1)}`}
                          title={`${trend.dates[idx]}: ${getPresenceText(present === 1)}`}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Recent Assessments */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Recent Assessments
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {Math.min(filteredRecords.length, 5)} of {filteredRecords.length} records
          </div>
        </div>

        {filteredRecords.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium">Date & Time</th>
                    <th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium">Risk Score</th>
                    <th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium">Present Symptoms</th>
                    <th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.slice(0, 5).map((record) => {
                    const { date, time } = formatDate(record.created_at)
                    const presentSymptoms = Object.entries(record.symptoms || {})
                      .filter(([_, present]) => present === 1)
                      .map(([symptom]) => formatSymptomName(symptom))
                    
                    return (
                      <tr key={record.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-3">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-900 dark:text-white font-medium">
                                {date}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                              {time}
                            </span>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${record.risk_score >= 70 ? 'bg-red-500' :
                                  record.risk_score >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                style={{ width: `${Math.min(record.risk_score, 100)}%` }}
                              />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{record.risk_score}%</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex flex-col gap-1">
                            {presentSymptoms.length > 0 ? (
                              <>
                                <div className="flex flex-wrap gap-1">
                                  {presentSymptoms.slice(0, 2).map((symptom, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full text-xs"
                                    >
                                      {symptom}
                                    </span>
                                  ))}
                                </div>
                                {presentSymptoms.length > 2 && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    +{presentSymptoms.length - 2} more
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400 text-sm">No symptoms present</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${riskColors[record.risk_level]}`}>
                            {record.risk_level} Risk
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredRecords.length > 5 && (
              <div className="text-center mt-4">
                <button
                  onClick={() => {/* Implement view all functionality */}}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center justify-center gap-1 mx-auto"
                >
                  View all {filteredRecords.length} assessments
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No assessments in this period</h4>
            <p className="text-gray-600 dark:text-gray-400">Try selecting a different time filter</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/dashboard/patient/symptoms"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
          >
            <ClipboardCheck className="w-5 h-5" />
            Start New Assessment
          </Link>
          <button
            onClick={exportData}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200"
            disabled={records.length === 0}
          >
            <Download className="w-5 h-5" />
            Export All Data
          </button>
          <button
            onClick={fetchSymptomHistory}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200"
          >
            <Activity className="w-5 h-5" />
            Refresh History
          </button>
        </div>
      </div>
    </div>
  )
}