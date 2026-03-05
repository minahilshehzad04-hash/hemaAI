// app/doctor/consultations/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Search, Filter, Clock, PlayCircle, CheckCircle, FileText, RefreshCw,
  User, Shield, Award, MessageCircle, Eye, X, Calendar, Mail
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Consultation, ConsultationStats } from '@/types/consultation'
import ChatInterface from '../../../../../components/Consultation/ChatInterface'
import StatsOverview from '../../../../../components/Consultation/StatsOverview'

const supabase = createClient()

export default function DoctorConsultations() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeTab, setActiveTab] = useState<'pending' | 'in-progress' | 'completed'>('pending')
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)

  // Helper function to get proper avatar URLs from Supabase storage
  const getAvatarUrl = (filePath: string | null) => {
    if (!filePath) return ''
    if (filePath.startsWith('http')) return filePath
    if (filePath.startsWith('avatars/') || filePath.includes('.jpg') || filePath.includes('.png') || filePath.includes('.webp')) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      return data.publicUrl
    }
    return filePath
  }

  // Stats calculation
  const consultationStats: ConsultationStats = {
    pending: consultations.filter(c => c.status === 'pending').length,
    inProgress: consultations.filter(c => c.status === 'accepted').length,
    completed: consultations.filter(c => c.status === 'completed').length,
    total: consultations.length
  }

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          console.error('User fetch error:', error)
          return
        }
        if (!user) {
          toast.error('Please log in to view consultations')
          return
        }
        console.log('👨‍⚕️ Doctor user ID:', user.id)
        setUserId(user.id)
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }
    fetchUser()
  }, [])

  // FIXED: Data fetching with proper doctor consultation logic
  const fetchConsultations = async () => {
    if (!userId) return

    try {
      setLoading(true)
      
      console.log('🔄 Fetching doctor consultations for user:', userId)

      // First, verify this user is actually a doctor
      const { data: doctorProfile, error: doctorError } = await supabase
        .from('doctor_profiles')
        .select('user_id')
        .eq('user_id', userId)
        .single()

      if (doctorError) {
        console.error('❌ Doctor profile not found:', doctorError)
        toast.error('Doctor profile not found. Please complete your doctor profile setup.')
        return
      }

      console.log('✅ Doctor profile verified:', doctorProfile)

      // Fetch consultations for this doctor
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          *,
          patient:profiles!consultations_patient_id_fkey(
            id,
            full_name,
            profile_picture_url,
            is_active
          )
        `)
        .eq('doctor_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Fetch consultations error:', error)
        toast.error('Failed to fetch consultations')
        return
      }

      console.log('✅ Doctor consultations fetched:', data?.length || 0, 'consultations')

      const mappedConsultations: Consultation[] = (data || []).map((item: any) => ({
        id: item.id,
        patient_id: item.patient_id,
        doctor_id: item.doctor_id,
        status: item.status,
        scheduled_time: item.scheduled_time,
        requested_time: item.requested_time,
        created_at: item.created_at,
        updated_at: item.updated_at,
        can_message: item.can_message || false,
        patient: Array.isArray(item.patient) ? item.patient[0] : item.patient
      }))

      setConsultations(mappedConsultations)

      // Show notification if there are pending consultations
      const pendingCount = mappedConsultations.filter(c => c.status === 'pending').length
      if (pendingCount > 0) {
        console.log(`📋 You have ${pendingCount} pending consultation requests`)
      }

    } catch (error) {
      console.error('❌ Error in fetchConsultations:', error)
      toast.error('Unexpected error occurred while loading consultations')
    } finally {
      setLoading(false)
    }
  }

  // FIXED: Use useEffect with fetch function
  useEffect(() => {
    if (userId) {
      fetchConsultations()

      // Set up real-time subscription for new consultations
      const consultationSubscription = supabase
        .channel('doctor-consultations')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'consultations',
            filter: `doctor_id=eq.${userId}`
          }, 
          (payload) => {
            console.log('🔄 Real-time consultation update:', payload)
            fetchConsultations() // Refresh data
          }
        )
        .subscribe()

      return () => {
        consultationSubscription.unsubscribe()
      }
    }
  }, [userId])

  // Filtered data based on active tab and filters
  const getFilteredData = () => {
    let data: Consultation[] = []
    
    switch (activeTab) {
      case 'pending':
        data = consultations.filter(c => c.status === 'pending')
        break
      case 'in-progress':
        data = consultations.filter(c => c.status === 'accepted')
        break
      case 'completed':
        data = consultations.filter(c => c.status === 'completed')
        break
    }

    // Apply search filter
    let filtered = data.filter(consultation => {
      const patientName = consultation.patient?.full_name?.toLowerCase() || ''
      return patientName.includes(searchTerm.toLowerCase()) ||
        consultation.status.toLowerCase().includes(searchTerm.toLowerCase())
    })

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(consultation => consultation.status === statusFilter)
    }

    return filtered
  }

  const filteredData = getFilteredData()

  // FIXED: Simplified action handlers - REMOVED BLOCK CHAT
  const handleAction = async (id: string, actionType: 'accept' | 'reject' | 'complete' | 'message') => {
    try {
      if (actionType === 'message') {
        // Open chat
        const consultation = consultations.find(c => c.id === id)
        if (consultation) {
          setSelectedConsultation(consultation)
          toast.success('Opening chat with patient...')
        }
        return
      }

      let newStatus = actionType === 'accept' ? 'accepted' : 
                     actionType === 'reject' ? 'rejected' :
                     actionType === 'complete' ? 'completed' : 'accepted'
      
      console.log(`🔄 Updating consultation ${id} to status: ${newStatus}`)

      const { error } = await supabase
        .from('consultations')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          // Auto-manage messaging: enable for accepted, disable for completed
          can_message: newStatus === 'completed' ? false : true
        })
        .eq('id', id)

      if (error) {
        console.error('❌ Update error:', error)
        throw error
      }

      console.log('✅ Consultation updated successfully')
      
      let successMessage = ''
      switch (actionType) {
        case 'accept':
          successMessage = 'Consultation accepted successfully'
          break
        case 'reject':
          successMessage = 'Consultation declined successfully'
          break
        case 'complete':
          successMessage = 'Consultation completed successfully'
          break
        default:
          successMessage = 'Action completed successfully'
      }

      toast.success(successMessage, {
        icon: '✅',
        duration: 3000
      })

      // Refresh data
      await fetchConsultations()

    } catch (error: any) {
      console.error('❌ Error in handleAction:', error)
      toast.error(error.message || 'Failed to update consultation', {
        icon: '⚠️'
      })
    }
  }

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'PT'
  }

  // Doctor Consultation Card Component
  const DoctorConsultationCard = ({ consultation }: { consultation: Consultation }) => {
    // Get status display info
    const getStatusInfo = () => {
      const status = consultation.status
      switch (status) {
        case 'pending':
          return { 
            text: 'Pending Approval', 
            color: 'bg-yellow-100 text-yellow-800 border-yellow-300', 
            icon: '⏳'
          }
        case 'accepted':
          return { 
            text: 'Confirmed', 
            color: 'bg-green-100 text-green-800 border-green-300', 
            icon: '✅'
          }
        case 'completed':
          return { 
            text: 'Completed', 
            color: 'bg-gray-100 text-gray-800 border-gray-300', 
            icon: '✓'
          }
        case 'rejected':
          return { 
            text: 'Declined', 
            color: 'bg-red-100 text-red-800 border-red-300', 
            icon: '❌'
          }
        case 'cancelled':
          return { 
            text: 'Cancelled', 
            color: 'bg-red-100 text-red-800 border-red-300', 
            icon: '❌'
          }
        default:
          return { 
            text: status, 
            color: 'bg-gray-100 text-gray-800 border-gray-300', 
            icon: '📋'
          }
      }
    }

    const statusInfo = getStatusInfo()
    const createdDate = new Date(consultation.created_at)

    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Patient Avatar with Fixed URL Handling */}
            <div className="relative flex-shrink-0">
              {consultation.patient?.profile_picture_url ? (
                <img
                  src={getAvatarUrl(consultation.patient.profile_picture_url)}
                  alt={consultation.patient.full_name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-200 group-hover:border-blue-300 transition-colors shadow-sm"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    // Show fallback when image fails to load
                    const fallback = target.nextElementSibling as HTMLElement
                    if (fallback) fallback.style.display = 'flex'
                  }}
                />
              ) : null}
              {/* Fallback Avatar - Always render but conditionally show */}
              <div 
                className={`w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl border-2 border-white shadow-sm ${
                  consultation.patient?.profile_picture_url ? 'hidden' : 'flex'
                }`}
              >
                {getInitials(consultation.patient?.full_name || 'PT')}
              </div>
            </div>

            {/* Patient Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    {consultation.patient?.full_name || 'Unknown Patient'}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold border border-blue-200">
                      <User className="w-3 h-3" />
                      Patient
                    </span>
                    {consultation.patient?.is_active && (
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium border border-green-200">
                        <Shield className="w-3 h-3" />
                        Active
                      </span>
                    )}
                    {/* Simplified Chat Status */}
                    {consultation.can_message ? (
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium border border-green-200">
                        <MessageCircle className="w-3 h-3" />
                        Chat Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-1 rounded-full text-xs font-medium border border-red-200">
                        <X className="w-3 h-3" />
                        Chat Disabled
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Status Badge */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-4">
                  <span className={`px-3 py-1.5 rounded-full border text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.icon} {statusInfo.text}
                  </span>
                  <span className="text-xs text-gray-500">
                    {createdDate.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Request Information */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center shadow-sm">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Request Date</p>
                <p className="text-gray-900 font-semibold">
                  {createdDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center shadow-sm">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Request Time</p>
                <p className="text-gray-900 font-semibold">
                  {createdDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SIMPLIFIED Actions Section - NO BLOCK CHAT */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          {/* Primary Action Buttons */}
          {consultation.status === 'pending' && (
            <div className="flex gap-2 flex-1">
              <button
                onClick={() => handleAction(consultation.id, 'accept')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md"
              >
                <CheckCircle className="w-4 h-4" />
                Accept
              </button>
              <button
                onClick={() => handleAction(consultation.id, 'reject')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md"
              >
                <X className="w-4 h-4" />
                Decline
              </button>
            </div>
          )}

          {consultation.status === 'accepted' && (
            <div className="flex gap-2 flex-1">
              <button 
                onClick={() => handleAction(consultation.id, 'message')}
                disabled={!consultation.can_message}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md ${
                  consultation.can_message
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                Message
              </button>
              
              {/* Complete Consultation Button - This will auto-block chat */}
              <button 
                onClick={() => handleAction(consultation.id, 'complete')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md"
              >
                <CheckCircle className="w-4 h-4" />
                Complete
              </button>
            </div>
          )}

          {(consultation.status === 'completed' || consultation.status === 'rejected' || consultation.status === 'cancelled') && (
            <button
              onClick={() => handleAction(consultation.id, 'message')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md"
            >
              <FileText className="w-4 h-4" />
              View Details
            </button>
          )}
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* Enhanced Header Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-lg mb-2">
            <Award className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-semibold text-gray-700">Doctor Consultation Portal</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            <span className="text-transparent bg-clip-text bg-blue-600">My</span> Consultations
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Manage your patient consultations efficiently and provide quality healthcare
          </p>
        </div>

        {/* Statistics Overview */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 p-8">
          <StatsOverview 
            stats={consultationStats}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="relative flex-1 sm:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search patients, status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 placeholder-gray-500 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-gray-600 font-medium text-sm"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-gray-600 font-medium text-sm"
              >
                Clear
              </button>
              <button
                onClick={fetchConsultations}
                className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium text-sm flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Filters Dropdown */}
          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tab Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  activeTab === 'pending' ? 'bg-yellow-50' :
                  activeTab === 'in-progress' ? 'bg-green-50' : 'bg-gray-50'
                }`}>
                  {activeTab === 'pending' && <Clock className="w-6 h-6 text-yellow-600" />}
                  {activeTab === 'in-progress' && <PlayCircle className="w-6 h-6 text-green-600" />}
                  {activeTab === 'completed' && <CheckCircle className="w-6 h-6 text-gray-600" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {activeTab === 'pending' && 'Pending Consultations'}
                    {activeTab === 'in-progress' && 'Active Consultations'}
                    {activeTab === 'completed' && 'Consultation History'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {activeTab === 'pending' && 'Consultations awaiting your approval or action'}
                    {activeTab === 'in-progress' && 'Your active and upcoming consultations'}
                    {activeTab === 'completed' && 'Your consultation history and records'}
                  </p>
                </div>
              </div>
              <div className="px-4 py-2 animate-blueShift text-white rounded-full text-lg font-semibold shadow-lg">
                {filteredData.length}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {filteredData.length > 0 ? (
              <div className="grid gap-6">
                {filteredData.map((consultation) => (
                  <DoctorConsultationCard 
                    key={consultation.id}
                    consultation={consultation}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                  {activeTab === 'pending' && <Clock className="w-12 h-12 text-gray-400" />}
                  {activeTab === 'in-progress' && <PlayCircle className="w-12 h-12 text-gray-400" />}
                  {activeTab === 'completed' && <CheckCircle className="w-12 h-12 text-gray-400" />}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {activeTab === 'pending' && 'No Pending Consultations'}
                  {activeTab === 'in-progress' && 'No Active Consultations'}
                  {activeTab === 'completed' && 'No Consultation History'}
                </h3>
                <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
                  {activeTab === 'pending' && 'All consultation requests have been processed. New requests will appear here automatically.'}
                  {activeTab === 'in-progress' && 'No active consultations at the moment. Accept pending requests to start consultations.'}
                  {activeTab === 'completed' && 'Your completed consultations will appear here for future reference.'}
                </p>
                <div className="flex gap-3 justify-center">
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors duration-200 font-semibold"
                    >
                      Clear Search
                    </button>
                  )}
                  <button
                    onClick={fetchConsultations}
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200 font-semibold flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      {selectedConsultation && userId && (
        <ChatInterface
          consultation={selectedConsultation}
          currentUserId={userId}
          onClose={() => setSelectedConsultation(null)}
          userType="doctor"
        />
      )}
    </div>   
  )  
}