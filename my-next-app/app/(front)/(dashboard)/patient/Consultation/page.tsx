// app/patient/consultations/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Calendar, Shield, User, RefreshCw,
  Clock, PlayCircle, CheckCircle,
  FileText, Search,
  Star, Award, Sparkles, ChevronRight,
  Video, MessageCircle, X,
  Filter
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Doctor, Consultation, ConsultationStats } from '@/types/consultation'
import ChatInterface from '../../../../../components/Consultation/ChatInterface'
import StatsOverview from '../../../../../components/Consultation/StatsOverview'

const supabase = createClient()

export default function PatientConsultations() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [doctorId, setDoctorId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [consultationStats, setConsultationStats] = useState<ConsultationStats>({
    pending: 0,
    inProgress: 0,
    completed: 0,
    total: 0
  })
  const [loadingStats, setLoadingStats] = useState(false)
  const [activeSection, setActiveSection] = useState<'book' | 'stats'>('book')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'pending' | 'in-progress' | 'completed'>('pending')
  const [hoveredCard, setHoveredCard] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)

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
          toast.error('Please log in to book consultations')
          return
        }
        setUserId(user.id)
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }
    fetchUser()
  }, [])

  // Fetch consultation statistics - FIXED VERSION
  const fetchConsultationStats = async () => {
    if (!userId) return;

    setLoadingStats(true);
    try {
      // First, get consultations with basic data
      const { data: consultationsData, error: consultationsError } = await supabase
        .from('consultations')
        .select('*')
        .eq('patient_id', userId)
        .order('created_at', { ascending: false });

      if (consultationsError) {
        console.error('Error fetching consultations:', consultationsError);
        toast.error('Failed to load consultations');
        return;
      }

      if (!consultationsData || consultationsData.length === 0) {
        setConsultations([]);
        setConsultationStats({
          pending: 0,
          inProgress: 0,
          completed: 0,
          total: 0
        });
        return;
      }

      // Get unique doctor IDs
      const doctorIds = [...new Set(consultationsData.map(c => c.doctor_id).filter(Boolean))];

      if (doctorIds.length === 0) {
        console.log('No doctor IDs found in consultations');
        setConsultations(consultationsData.map(c => ({
          ...c,
          patient: null,
          doctor: null,
          can_message: c.status === 'accepted'
        })));
        return;
      }

      // Fetch doctor profiles and user profiles separately to avoid complex joins
      const { data: doctorProfiles, error: doctorProfilesError } = await supabase
        .from('doctor_profiles')
        .select('*')
        .in('user_id', doctorIds);

      if (doctorProfilesError) {
        console.error('Error fetching doctor profiles:', doctorProfilesError);
      }

      // Fetch user profiles for doctors
      const { data: userProfiles, error: userProfilesError } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, is_active')
        .in('id', doctorIds);

      if (userProfilesError) {
        console.error('Error fetching user profiles:', userProfilesError);
      }

      // Map consultations with doctor data
      const mappedConsultations: Consultation[] = consultationsData.map(consultation => {
        const doctorProfile = doctorProfiles?.find(d => d.user_id === consultation.doctor_id);
        const userProfile = userProfiles?.find(u => u.id === consultation.doctor_id);

        // Create doctor object from available data
        const doctor: Doctor | null = consultation.doctor_id ? {
          id: consultation.doctor_id,
          full_name: userProfile?.full_name || 'Unknown Doctor',
          profile_picture_url: userProfile?.profile_picture_url || doctorProfile?.profile_picture_url || '',
          specialization: doctorProfile?.specialization || 'General Practitioner',
          qualifications: doctorProfile?.qualifications || 'MBBS, Medical Doctor',
          license_number: doctorProfile?.license_number || 'Not specified',
          verified: doctorProfile?.verified || false,
          is_active: Boolean(userProfile?.is_active && doctorProfile?.is_active),
          contact: doctorProfile?.contact || '',
          experience: doctorProfile?.experience,
          rating: doctorProfile?.rating,
          consultation_fee: doctorProfile?.consultation_fee
        } : null;

        return {
          id: consultation.id,
          patient_id: consultation.patient_id,
          doctor_id: consultation.doctor_id,
          status: consultation.status,
          scheduled_time: consultation.scheduled_time,
          requested_time: consultation.requested_time,
          created_at: consultation.created_at,
          updated_at: consultation.updated_at,
          can_message: consultation.status === 'accepted',
          patient: undefined,
          doctor
        };
      });

      setConsultations(mappedConsultations);

      // Calculate stats
      const stats = {
        pending: mappedConsultations.filter(c => c.status === 'pending').length,
        inProgress: mappedConsultations.filter(c => c.status === 'accepted').length,
        completed: mappedConsultations.filter(c => c.status === 'completed').length,
        total: mappedConsultations.length
      };

      setConsultationStats(stats);

    } catch (error) {
      console.error('Error in fetchConsultationStats:', error);
      toast.error('Failed to load consultations');
    } finally {
      setLoadingStats(false);
    }
  };
  // Fetch doctors
  const fetchDoctors = async () => {
    setLoadingDoctors(true)
    setDoctors([])

    try {
      // First get all active doctor profiles
      const { data: doctorProfiles, error: profilesError } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('is_active', true)

      if (profilesError) {
        throw new Error(`Failed to load doctor profiles: ${profilesError.message}`)
      }

      if (!doctorProfiles || doctorProfiles.length === 0) {
        toast.error('No active doctors available')
        setDoctors([])
        return
      }

      // Get user profiles for these doctors
      const doctorUserIds = doctorProfiles.map(profile => profile.user_id)

      const { data: userProfiles, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, is_active')
        .in('id', doctorUserIds)
        .eq('is_active', true)

      if (usersError) {
        throw new Error(`Failed to load user profiles: ${usersError.message}`)
      }

      // Combine the data
      const doctorsList: Doctor[] = doctorProfiles.map(doctorProfile => {
        const userProfile = userProfiles?.find(user => user.id === doctorProfile.user_id)

        if (!userProfile) {
          console.warn(`No user profile found for doctor profile: ${doctorProfile.id}`)
          return null
        }

        const profilePicture = doctorProfile.profile_picture_url || userProfile.profile_picture_url

        return {
          id: userProfile.id,
          full_name: userProfile.full_name || 'Unknown Doctor',
          profile_picture_url: profilePicture,
          specialization: doctorProfile.specialization || 'General Practitioner',
          qualifications: doctorProfile.qualifications || 'MBBS, Medical Doctor',
          license_number: doctorProfile.license_number || 'Not specified',
          verified: doctorProfile.verified || false,
          is_active: userProfile.is_active && doctorProfile.is_active,
          contact: doctorProfile.contact || '',
          experience: doctorProfile.experience,
          rating: doctorProfile.rating,
          consultation_fee: doctorProfile.consultation_fee
        }
      }).filter((doctor): doctor is Doctor => doctor !== null && doctor.is_active && doctor.full_name !== null && doctor.full_name !== undefined)

      setDoctors(doctorsList)

      if (doctorsList.length === 0) {
        toast.error('No active doctors available')
      }

    } catch (error: any) {
      console.error('❌ Error loading doctors:', error)
      toast.error(error.message || 'Failed to load doctors list')
    } finally {
      setLoadingDoctors(false)
    }
  }

  // Fetch doctors and stats on component mount
  useEffect(() => {
    fetchDoctors()
    if (userId) {
      fetchConsultationStats()
    }
  }, [userId])

  // Handle doctor selection
  const handleDoctorSelect = (doctor: Doctor) => {
    if (!doctor.is_active) {
      toast.error('This doctor is not currently available')
      return
    }
    setDoctorId(doctor.id)
    toast.success(`Selected Dr. ${doctor.full_name}`)
  }

  // Handle consultation request with error handling for notifications
  // Handle consultation request with better duplicate checking
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!doctorId) {
      toast.error('Please select a doctor first')
      return
    }

    if (!userId) {
      toast.error('User not found. Please log in again.')
      return
    }

    const selectedDoctor = doctors.find(d => d.id === doctorId)
    if (!selectedDoctor) {
      toast.error('Selected doctor not found')
      return
    }

    setSubmitting(true)
    try {
      // First, let's verify the doctor exists and is active
      const { data: doctorCheck, error: doctorError } = await supabase
        .from('doctor_profiles')
        .select('user_id, is_active')
        .eq('user_id', doctorId)
        .eq('is_active', true)
        .single()

      if (doctorError || !doctorCheck) {
        throw new Error('Doctor not found or not active')
      }

      // IMPROVED: Check for existing consultations with better status checking
      const { data: existingConsultations, error: checkError } = await supabase
        .from('consultations')
        .select('id, status')
        .eq('patient_id', userId)
        .eq('doctor_id', doctorId)
        .in('status', ['pending', 'accepted', 'in_progress']) // Added more statuses
        .maybeSingle()

      if (existingConsultations) {
        const statusMessages = {
          'pending': 'pending approval',
          'accepted': 'accepted and active',
          'in_progress': 'currently in progress'
        }

        const statusText = statusMessages[existingConsultations.status as keyof typeof statusMessages] || existingConsultations.status
        throw new Error(`You already have a ${statusText} consultation with this doctor`)
      }

      // Also check for recently completed consultations (within last 24 hours)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

      const { data: recentCompleted, error: recentError } = await supabase
        .from('consultations')
        .select('id, status, created_at')
        .eq('patient_id', userId)
        .eq('doctor_id', doctorId)
        .eq('status', 'completed')
        .gte('created_at', twentyFourHoursAgo)
        .maybeSingle()

      if (recentCompleted) {
        throw new Error('You had a consultation with this doctor in the last 24 hours. Please wait before booking another.')
      }

      // Create consultation with ONLY the required columns
      const consultationData = {
        patient_id: userId,
        doctor_id: doctorId,
        status: 'pending',
        requested_time: new Date().toISOString()
      }

      console.log('Creating consultation with data:', consultationData)

      const { data: newConsultation, error: insertErr } = await supabase
        .from('consultations')
        .insert([consultationData])
        .select()
        .single()

      if (insertErr) {
        console.error('❌ Consultation insert error:', insertErr)

        // Handle specific error cases
        if (insertErr.code === '23505') {
          throw new Error('You already have a pending consultation with this doctor')
        } else if (insertErr.code === '23503') {
          throw new Error('Doctor or patient not found')
        } else if (insertErr.code === '42501') {
          throw new Error('Permission denied. Please check your account permissions.')
        } else if (insertErr.code === '23502') {
          throw new Error('Database constraint error. Please contact support.')
        } else {
          throw new Error(`Failed to create consultation: ${insertErr.message}`)
        }
      }

      console.log('✅ Consultation created successfully:', newConsultation)

      toast.success(
        `Consultation requested with Dr. ${selectedDoctor.full_name}! The doctor will be notified.`,
        { duration: 3000 }
      )

      // Reset form and refresh stats
      setDoctorId('')
      await fetchConsultationStats()
      setActiveSection('stats')

    } catch (error: any) {
      console.error('❌ Error requesting consultation:', error)

      // Check if it's a notification error and provide specific guidance
      if (error.message?.includes('notifications') || error.message?.includes('title')) {
        toast.error('System configuration error. Please contact support.')
      } else {
        toast.error(error.message || 'Failed to request consultation')
      }
    } finally {
      setSubmitting(false)
    }
  }
  // FIXED: Enhanced patient actions with complete message functionality
  const handlePatientAction = async (id: string, actionType: 'cancel' | 'view' | 'message' | 'join') => {
    try {
      if (actionType === 'cancel') {
        // First verify the consultation exists and belongs to current user
        const { data: consultation, error: fetchError } = await supabase
          .from('consultations')
          .select('*')
          .eq('id', id)
          .eq('patient_id', userId)
          .single()

        if (fetchError || !consultation) {
          throw new Error('Consultation not found or you do not have permission to cancel it')
        }

        // Check if cancellation is allowed
        if (!['pending', 'accepted'].includes(consultation.status)) {
          throw new Error(`Cannot cancel a ${consultation.status} consultation`)
        }

        // FIXED: Only update the status field
        const { error } = await supabase
          .from('consultations')
          .update({
            status: 'cancelled'
          })
          .eq('id', id)
          .eq('patient_id', userId)

        if (error) {
          console.error('Update error details:', error)

          // Handle specific error cases
          if (error.code === '42501') {
            throw new Error('Permission denied. You can only cancel your own consultations.')
          } else if (error.code === '23502') {
            throw new Error('Database constraint error. Please contact support.')
          } else {
            throw new Error(`Failed to cancel: ${error.message}`)
          }
        }

        // Refresh data
        await fetchConsultationStats()
        toast.success('Consultation cancelled successfully')
        return
      }
      else if (actionType === 'message') {
        // FIXED: Find the consultation and set it as selected to open chat
        const consultation = consultations.find(c => c.id === id)
        if (consultation) {
          setSelectedConsultation(consultation)
          toast.success('Opening chat with doctor...')
        } else {
          toast.error('Consultation not found')
        }
        return
      }
      else if (actionType === 'join') {
        // Handle join consultation (video call)
        toast.success('Starting video consultation...')
        // Add your video call logic here
      }
      else if (actionType === 'view') {
        // Handle view details
        const consultation = consultations.find(c => c.id === id)
        if (consultation) {
          // You might want to show details in a modal or navigate to details page
          console.log('View consultation:', consultation)
          toast.success('Opening consultation details...')
        }
      }

    } catch (error: any) {
      console.error('Error in handlePatientAction:', error)
      toast.error(error.message || 'Failed to perform action')
    }
  }

  // Filter consultations based on active tab and search
  const getFilteredConsultations = () => {
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
      return consultation.doctor?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.doctor?.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.doctor?.qualifications?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    })

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(consultation => consultation.status === statusFilter)
    }

    return filtered
  }

  // Better avatar URL handling
  const getAvatarUrl = (filePath: string | null) => {
    if (!filePath) {
      return '' // Return empty for fallback
    }

    // Check if it's already a full URL
    if (filePath.startsWith('http')) {
      return filePath
    }

    // If it's a storage path
    if (filePath.startsWith('avatars/') || filePath.includes('.jpg') || filePath.includes('.png')) {
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)
      return data.publicUrl
    }

    return filePath
  }

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'DR'
  }

  // DOCTOR CARD COMPONENT
  const DoctorCard = ({ doctor, isSelected, onSelect }: {
    doctor: Doctor
    isSelected: boolean
    onSelect: (doctor: Doctor) => void
  }) => {
    const getGradient = (index: number) => {
      const gradients = [
        'animate-blueShift',
        'animate-blueShift',
        'animate-blueShift',
        'animate-blueShift',
        'animate-blueShift',
        'animate-blueShift',
        'animate-blueShift',
        'animate-blueShift'
      ]
      return gradients[index % gradients.length]
    }

    const doctorIndex = doctors.findIndex(d => d.id === doctor.id)
    const isHovered = hoveredCard === doctor.id
    const avatarUrl = doctor.profile_picture_url ? getAvatarUrl(doctor.profile_picture_url) : ''

    const getQualifications = () => {
      if (!doctor.qualifications) return ['Medical Doctor']

      if (typeof doctor.qualifications === 'string') {
        const quals = doctor.qualifications.split(',').map(q => q.trim()).filter(q => q)
        return quals.length > 0 ? quals : ['Medical Doctor']
      }

      if (Array.isArray(doctor.qualifications)) {
        return doctor.qualifications.length > 0 ? doctor.qualifications : ['Medical Doctor']
      }

      return ['Medical Doctor']
    }

    const qualifications = getQualifications()

    return (
      <div
        className={`group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden ${isSelected ? 'ring-4 ring-blue-500 scale-105' : 'hover:scale-102'
          }`}
        onClick={() => onSelect(doctor)}
        onMouseEnter={() => setHoveredCard(doctor.id)}
        onMouseLeave={() => setHoveredCard('')}
      >
        <div className="absolute top-0 right-0 w-32 h-32 animate-blueShift rounded-bl-full opacity-50"></div>

        {isSelected && (
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-bounce">
              <Star className="w-3 h-3 fill-current" />
              Selected
            </div>
          </div>
        )}

        {doctor.verified && (
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-green-500 p-2 rounded-full shadow-lg">
              <Shield className="w-4 h-4 text-white" />
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={doctor.full_name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-blue-100"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              ) : null}
              <div
                className={`w-20 h-20 rounded-full bg-gradient-to-r ${getGradient(doctorIndex)} flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-xl ring-4 ring-blue-100 ${avatarUrl ? 'hidden' : 'flex'
                  }`}
              >
                {getInitials(doctor.full_name || 'DR')}
              </div>

              <div className="absolute bottom-1 right-1">
                <div className="w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center space-y-3">
            <div>
              <h3 className="text-l font-bold text-gray-900 mb-1">
                Dr. {doctor.full_name}
              </h3>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-1.5 rounded-full">
                <Award className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">
                  {doctor.specialization}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 space-y-2">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-700 mb-2">
                  <span className="font-medium">🎓</span>
                  <span className="font-medium">Qualifications</span>
                </div>

                {qualifications.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {qualifications.map((qualification, index) => (
                      <div
                        key={index}
                        className="text-xs font-medium text-blue-700 bg-white py-1 px-2 rounded-md border border-blue-300 shadow-sm hover:bg-blue-50 transition-colors duration-200"
                      >
                        {qualification}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 italic py-1">
                    No qualifications listed
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-600 pt-2 border-t border-blue-100">
                <span className="font-medium">📋</span>
                <span>License: {doctor.license_number || 'Not specified'}</span>
              </div>
            </div>

            <button
              className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${isSelected
                ? 'animate-blueShift text-white shadow-lg transform scale-105'
                : 'animate-blueShift text-white hover:from-blue-600 hover:to-purple-700 hover:shadow-md'
                }`}
            >
              {isSelected ? (
                <>
                  <Star className="w-4 h-4 fill-current" />
                  Selected
                </>
              ) : (
                <>
                  Select Doctor
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>

        <div
          className={`absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300 ${isHovered && !isSelected ? 'opacity-100' : 'opacity-0'
            }`}
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
          }}
        ></div>
      </div>
    )
  }

  // PATIENT CONSULTATION CARD
  const PatientConsultationCard = ({ consultation }: { consultation: Consultation }) => {
    const getDoctorQualifications = () => {
      if (!consultation.doctor?.qualifications) return ['Medical Doctor']

      if (typeof consultation.doctor.qualifications === 'string') {
        const quals = consultation.doctor.qualifications.split(',').map(q => q.trim()).filter(q => q)
        return quals.length > 0 ? quals : ['Medical Doctor']
      }

      if (Array.isArray(consultation.doctor.qualifications)) {
        return consultation.doctor.qualifications.length > 0 ? consultation.doctor.qualifications : ['Medical Doctor']
      }

      return ['Medical Doctor']
    }

    const qualifications = getDoctorQualifications()

    const getDoctorName = () => {
      const fullName = consultation.doctor?.full_name || 'Unknown Doctor'
      return fullName.replace(/^Dr\.\s*/i, '').trim()
    }

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
        case 'in_progress':
          return {
            text: 'In Progress',
            color: 'bg-blue-100 text-blue-800 border-blue-300',
            icon: '🔵'
          }
        case 'completed':
          return {
            text: 'Completed',
            color: 'bg-gray-100 text-gray-800 border-gray-300',
            icon: '✓'
          }
        case 'cancelled':
          return {
            text: 'Cancelled',
            color: 'bg-red-300 text-red-800 border-red-300',
            icon: '❌'
          }
        case 'rejected':
          return {
            text: 'Declined',
            color: 'bg-red-300 text-red-800 border-red-300',
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
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="relative flex-shrink-0">
              {consultation.doctor?.profile_picture_url ? (
                <img
                  src={getAvatarUrl(consultation.doctor.profile_picture_url)}
                  alt={consultation.doctor.full_name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-200 group-hover:border-blue-300 transition-colors shadow-sm"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              ) : null}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl border-2 border-white shadow-sm ${consultation.doctor?.profile_picture_url ? 'hidden' : 'flex'
                }`}>
                {getInitials(consultation.doctor?.full_name || 'DR')}
              </div>

              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    Dr. {getDoctorName()}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold border border-blue-200">
                      <Award className="w-3 h-3" />
                      {consultation.doctor?.specialization || 'General Practitioner'}
                    </span>
                    {consultation.doctor?.verified && (
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium border border-green-200">
                        <Shield className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                    {consultation.can_message && (
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium border border-green-200">
                        <MessageCircle className="w-3 h-3" />
                        Chat Enabled
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-4">
                  <span className={`px-3 py-1.5 rounded-full border text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.icon} {statusInfo.text}
                  </span>
                  <span className="text-xs text-gray-500">
                    {createdDate.toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex flex-wrap gap-1.5">
                  {qualifications.slice(0, 2).map((qual, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200 font-medium"
                    >
                      {qual}
                    </span>
                  ))}
                  {qualifications.length > 2 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg border border-gray-300 font-medium">
                      +{qualifications.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

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

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          {consultation.status === 'pending' && (
            <button
              onClick={() => handlePatientAction(consultation.id, 'cancel')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md"
            >
              <X className="w-4 h-4" />
              Cancel Request
            </button>
          )}

          {consultation.status === 'accepted' && (
            <div className="flex gap-2 flex-1">
              <button
                onClick={() => handlePatientAction(consultation.id, 'join')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md"
              >
                <Video className="w-4 h-4" />
                Start Consultation
              </button>
              <button
                onClick={() => handlePatientAction(consultation.id, 'message')}
                disabled={!consultation.can_message}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md ${consultation.can_message
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
              >
                <MessageCircle className="w-4 h-4" />
                Message
              </button>
            </div>
          )}

          {(consultation.status === 'completed' || consultation.status === 'rejected' || consultation.status === 'cancelled') && (
            <button
              onClick={() => handlePatientAction(consultation.id, 'view')}
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

  const filteredConsultations = getFilteredConsultations()
  const selectedDoctor = doctors.find(d => d.id === doctorId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">

        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-gray-900">
            <span className="text-transparent bg-clip-text bg-blue-600">Doctor</span> and Consultations
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Select from our verified and experienced medical professionals for personalized healthcare
          </p>
        </div>

        <div className="flex justify-center">
          <div className="bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveSection('book')}
                className={`px-8 py-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-3 ${activeSection === 'book'
                  ? 'animate-blueShift text-white shadow-lg'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
              >
                <Calendar className="w-5 h-5" />
                Book Consultation
              </button>
              <button
                onClick={() => setActiveSection('stats')}
                className={`px-8 py-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-3 ${activeSection === 'stats'
                  ? 'animate-blueShift text-white shadow-lg'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
              >
                <FileText className="w-5 h-5" />
                My Consultations
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {activeSection === 'book' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 animate-blueShift rounded-2xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Book New Consultation</h2>
                    <p className="text-gray-600">Select from our verified healthcare professionals</p>
                  </div>
                </div>
              </div>

              {selectedDoctor && (
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg overflow-hidden">
                          {selectedDoctor.profile_picture_url ? (
                            <img
                              src={getAvatarUrl(selectedDoctor.profile_picture_url)}
                              alt={selectedDoctor.full_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl ${selectedDoctor.profile_picture_url ? 'hidden' : 'flex'
                            }`}>
                            {getInitials(selectedDoctor.full_name || 'DR')}
                          </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-gray-900 text-lg">Dr. {selectedDoctor.full_name}</h3>
                          {selectedDoctor.verified && (
                            <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                              <Shield className="w-3 h-3" />
                              Verified
                            </div>
                          )}
                        </div>
                        <p className="text-blue-600 font-semibold">{selectedDoctor.specialization}</p>

                        <div className="flex flex-wrap gap-1 mt-1">
                          {(() => {
                            const quals = typeof selectedDoctor.qualifications === 'string'
                              ? selectedDoctor.qualifications.split(',').map(q => q.trim())
                              : Array.isArray(selectedDoctor.qualifications)
                                ? selectedDoctor.qualifications
                                : []

                            return quals.slice(0, 3).map((qual, index) => (
                              <span
                                key={index}
                                className="text-xs bg-white px-2 py-1 rounded-md border border-blue-200 text-gray-600"
                              >
                                {qual}
                              </span>
                            ))
                          })()}
                          {(() => {
                            const quals = typeof selectedDoctor.qualifications === 'string'
                              ? selectedDoctor.qualifications.split(',').map(q => q.trim())
                              : Array.isArray(selectedDoctor.qualifications)
                                ? selectedDoctor.qualifications
                                : []
                            return quals.length > 3 && (
                              <span className="text-xs bg-white px-2 py-1 rounded-md border border-blue-200 text-gray-500">
                                +{quals.length - 3} more
                              </span>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDoctorId('')}
                      className="text-red-500 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Specialists ({doctors.length})
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        {doctors.filter(d => d.is_active).length} Available
                      </span>
                      <span>•</span>
                      <span>{doctors.filter(d => d.verified).length} Verified</span>
                      <span>•</span>
                      <span>{doctors.filter(d => d.specialization !== 'General Practitioner').length} Specialists</span>
                    </div>
                  </div>
                </div>

                {loadingDoctors ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading healthcare professionals...</p>
                    <p className="text-gray-400 text-sm mt-2">Finding the best doctors for you</p>
                  </div>
                ) : doctors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctors.map(doctor => (
                      <DoctorCard
                        key={doctor.id}
                        doctor={doctor}
                        isSelected={doctorId === doctor.id}
                        onSelect={handleDoctorSelect}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50/30">
                    <User className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-xl mb-2">No doctors available</p>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Our healthcare professionals are currently busy. Please check back later or contact support for emergency cases.
                    </p>
                    <button
                      onClick={fetchDoctors}
                      className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Refresh Doctors List
                    </button>
                  </div>
                )}
              </div>

              {selectedDoctor && (
                <form onSubmit={handleSubmit}>
                  <button
                    type="submit"
                    disabled={submitting || loadingDoctors}
                    className="w-full animate-blueShift text-white py-3 px-5 rounded-2xl font-bold hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-2xl hover:shadow-3xl flex items-center justify-center gap-3 text-lg"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Booking Consultation...
                      </>
                    ) : (
                      <>
                        Book with Dr. {selectedDoctor.full_name}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {activeSection === 'stats' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <div className="relative flex-1 sm:max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search by doctor name, status, or specialization..."
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
                      onClick={fetchConsultationStats}
                      className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium text-sm flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                  </div>
                </div>

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

              <StatsOverview
                stats={consultationStats}
                loading={loadingStats}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${activeTab === 'pending' ? 'bg-yellow-50' :
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
                          {activeTab === 'pending' && 'Consultations awaiting doctor confirmation'}
                          {activeTab === 'in-progress' && 'Your active consultations'}
                          {activeTab === 'completed' && 'Your past consultation records'}
                        </p>
                      </div>
                    </div>
                    <div className="px-4 py-2 animate-blueShift text-white rounded-full text-lg font-semibold shadow-lg">
                      {filteredConsultations.length}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {filteredConsultations.length > 0 ? (
                    <div className="grid gap-6">
                      {filteredConsultations.map((consultation) => (
                        <PatientConsultationCard
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
                        {activeTab === 'pending' && 'All your consultation requests have been processed. Check active consultations for updates.'}
                        {activeTab === 'in-progress' && 'You don\'t have any active consultations at the moment.'}
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
                        {activeTab === 'pending' && (
                          <button
                            onClick={() => setActiveSection('book')}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                          >
                            Book New Consultation
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Interface - FIXED: Now properly opens when clicking Message button */}
      {selectedConsultation && userId && (
        <ChatInterface
          consultation={selectedConsultation}
          currentUserId={userId}
          onClose={() => setSelectedConsultation(null)}
          userType="patient"
        />
      )}
    </div>
  )
}