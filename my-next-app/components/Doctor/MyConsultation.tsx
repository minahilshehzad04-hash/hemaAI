// 'use client'

// import { useState, useEffect } from 'react'
// import React from 'react'
// import {
//     FileText,
//     Calendar,
//     Clock,
//     Video,
//     CheckCircle,
//     XCircle,
//     CalendarClock,
//     Search,
//     Filter,
//     PlayCircle,
//     PauseCircle,
//     AlertCircle,
//     User,
//     ArrowRight,
//     MoreVertical,
//     Eye,
//     MessageCircle,
//     Phone
// } from 'lucide-react'
// import { toast } from 'react-hot-toast'
// import { createClient } from '@/lib/supabase/client'

// interface Patient {
//     full_name: string
//     profile_picture_url: string | null
// }

// interface Consultation {
//     id: string
//     patient_id: string
//     doctor_id: string
//     scheduled_time: string
//     requested_time: string | null
//     status: string
//     patient: Patient | null
//     created_at: string
// }

// export default function MyConsultation() {
//     const [consultations, setConsultations] = useState<Consultation[]>([])
//     const [pendingConsultations, setPendingConsultations] = useState<Consultation[]>([])
//     const [inProgressConsultations, setInProgressConsultations] = useState<Consultation[]>([])
//     const [completedConsultations, setCompletedConsultations] = useState<Consultation[]>([])
//     const [loading, setLoading] = useState(true)
//     const [searchTerm, setSearchTerm] = useState('')
//     const [showFilters, setShowFilters] = useState(false)
//     const [statusFilter, setStatusFilter] = useState('all')
//     const [activeTab, setActiveTab] = useState<'pending' | 'in-progress' | 'completed'>('pending')
//     const supabase = createClient()

//     // ✅ CATEGORIZE CONSULTATIONS
//     const categorizeConsultations = (data: Consultation[]) => {
//         const pending = data.filter(c => c.status === 'pending' || c.status === 'reschedule_pending')
//         const inProgress = data.filter(c => c.status === 'accepted' || c.status === 'rescheduled')
//         const completed = data.filter(c => c.status === 'completed')
        
//         setPendingConsultations(pending)
//         setInProgressConsultations(inProgress)
//         setCompletedConsultations(completed)
//     }

//     // ✅ FILTERED DATA BASED ON ACTIVE TAB
//     const getFilteredData = () => {
//         let data: Consultation[] = []
        
//         switch (activeTab) {
//             case 'pending':
//                 data = pendingConsultations
//                 break
//             case 'in-progress':
//                 data = inProgressConsultations
//                 break
//             case 'completed':
//                 data = completedConsultations
//                 break
//         }

//         return data.filter(consultation => {
//             const matchesSearch = 
//                 consultation.patient?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 consultation.status.toLowerCase().includes(searchTerm.toLowerCase())
            
//             const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter
//             return matchesSearch && matchesStatus
//         })
//     }

//     const filteredData = getFilteredData()

//     // ✅ DATA FETCHING
//     useEffect(() => {
//         const fetchConsultations = async () => {
//             try {
//                 setLoading(true)
                
//                 const { data: { user }, error: userError } = await supabase.auth.getUser()
//                 if (userError || !user) {
//                     toast.error('Failed to fetch user')
//                     return
//                 }

//                 const { data, error } = await supabase
//                     .from('consultations')
//                     .select(`
//                         id,
//                         patient_id,
//                         doctor_id,
//                         scheduled_time,
//                         requested_time,
//                         status,
//                         created_at,
//                         patient:profiles!consultations_patient_id_fkey(
//                             full_name,
//                             profile_picture_url
//                         )
//                     `)
//                     .eq('doctor_id', user.id)
//                     .order('scheduled_time', { ascending: true })

//                 if (error) {
//                     console.error('Fetch consultations error:', error)
//                     toast.error('Failed to fetch consultations')
//                     return
//                 }

//                 const mappedConsultations: Consultation[] = (data || []).map((item: any) => ({
//                     id: item.id,
//                     patient_id: item.patient_id,
//                     doctor_id: item.doctor_id,
//                     scheduled_time: item.scheduled_time,
//                     requested_time: item.requested_time,
//                     status: item.status,
//                     created_at: item.created_at,
//                     patient: Array.isArray(item.patient) ? item.patient[0] : item.patient
//                 }))

//                 setConsultations(mappedConsultations)
//                 categorizeConsultations(mappedConsultations)

//             } catch (error) {
//                 console.error('Error in fetchConsultations:', error)
//                 toast.error('Unexpected error occurred')
//             } finally {
//                 setLoading(false)
//             }
//         }

//         fetchConsultations()
//     }, [])

//     // ✅ ACTION HANDLERS
//     const handleAction = async (id: string, actionType: 'accept' | 'reject' | 'complete' | 'start') => {
//         try {
//             let newStatus = actionType === 'accept' ? 'accepted' : 
//                            actionType === 'reject' ? 'rejected' :
//                            actionType === 'complete' ? 'completed' : 'accepted'

//             if (actionType === 'start') {
//                 // For starting consultation - you might want to handle video call initiation
//                 toast.success('Starting consultation...')
//                 // Add your video call logic here
//                 return
//             }
            
//             const { error } = await supabase
//                 .from('consultations')
//                 .update({ 
//                     status: newStatus,
//                     updated_at: new Date().toISOString()
//                 })
//                 .eq('id', id)

//             if (error) throw error

//             // Refresh data
//             const updatedConsultations = consultations.map(c => 
//                 c.id === id ? { ...c, status: newStatus } : c
//             )
//             setConsultations(updatedConsultations)
//             categorizeConsultations(updatedConsultations)
            
//             toast.success(`Consultation ${actionType}ed successfully`, {
//                 icon: '✅',
//                 duration: 3000
//             })

//         } catch (error) {
//             console.error('Error in handleAction:', error)
//             toast.error('Failed to update consultation', {
//                 icon: '⚠️'
//             })
//         }
//     }

//     // ✅ GET PATIENT DATA SAFELY
//     const getPatientData = (consultation: Consultation) => {
//         return {
//             full_name: consultation.patient?.full_name || 'Unknown Patient',
//             profile_picture_url: consultation.patient?.profile_picture_url || '/default-avatar.png'
//         }
//     }

//     // ✅ STATUS BADGE COMPONENT
//     const StatusBadge = ({ status }: { status: string }) => {
//         const statusConfig = {
//             accepted: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: PlayCircle, label: 'Accepted' },
//             rejected: { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle, label: 'Rejected' },
//             reschedule_pending: { color: 'bg-orange-50 text-orange-700 border-orange-200', icon: CalendarClock, label: 'Reschedule Pending' },
//             pending: { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock, label: 'Pending' },
//             completed: { color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle, label: 'Completed' },
//             cancelled: { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: XCircle, label: 'Cancelled' },
//             rescheduled: { color: 'bg-purple-50 text-purple-700 border-purple-200', icon: CalendarClock, label: 'Rescheduled' }
//         }

//         const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
//         const IconComponent = config.icon

//         return (
//             <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
//                 <IconComponent className="w-3 h-3" />
//                 {config.label}
//             </span>
//         )
//     }

//     // ✅ CONSULTATION CARD COMPONENT
//     const ConsultationCard = ({ consultation, showActions = true }: { consultation: Consultation, showActions?: boolean }) => {
//         const patient = getPatientData(consultation)
//         const isToday = new Date(consultation.scheduled_time).toDateString() === new Date().toDateString()
//         const isUpcoming = new Date(consultation.scheduled_time) > new Date()

//         return (
//             <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group">
//                 {/* Header */}
//                 <div className="flex items-start justify-between mb-4">
//                     <div className="flex items-center gap-3">
//                         <div className="relative">
//                             <img
//                                 src={patient.profile_picture_url}
//                                 alt={patient.full_name}
//                                 className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 group-hover:border-blue-200 transition-colors"
//                             />
//                             {isToday && (
//                                 <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
//                             )}
//                         </div>
//                         <div>
//                             <h3 className="font-semibold text-gray-900 text-lg">
//                                 {patient.full_name}
//                             </h3>
//                             <p className="text-gray-500 text-sm">Consultation</p>
//                         </div>
//                     </div>
//                     <StatusBadge status={consultation.status} />
//                 </div>

//                 {/* Schedule Info */}
//                 <div className="space-y-2 mb-4">
//                     <div className="flex items-center gap-3 text-gray-700">
//                         <Calendar className="w-4 h-4 text-gray-400" />
//                         <span className="text-sm font-medium">
//                             {new Date(consultation.scheduled_time).toLocaleDateString('en-US', {
//                                 weekday: 'long',
//                                 month: 'short',
//                                 day: 'numeric',
//                                 year: 'numeric'
//                             })}
//                         </span>
//                         {isToday && (
//                             <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
//                                 Today
//                             </span>
//                         )}
//                         {isUpcoming && !isToday && (
//                             <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
//                                 Upcoming
//                             </span>
//                         )}
//                     </div>
//                     <div className="flex items-center gap-3 text-gray-700">
//                         <Clock className="w-4 h-4 text-gray-400" />
//                         <span className="text-sm font-medium">
//                             {new Date(consultation.scheduled_time).toLocaleTimeString('en-US', {
//                                 hour: '2-digit',
//                                 minute: '2-digit'
//                             })}
//                         </span>
//                     </div>
//                 </div>

//                 {/* Actions */}
//                 {showActions && (
//                     <div className="flex gap-2 pt-4 border-t border-gray-100">
//                         {consultation.status === 'pending' && (
//                             <>
//                                 <button
//                                     onClick={() => handleAction(consultation.id, 'accept')}
//                                     className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium text-sm"
//                                 >
//                                     <CheckCircle className="w-4 h-4" />
//                                     Accept
//                                 </button>
//                                 <button
//                                     onClick={() => handleAction(consultation.id, 'reject')}
//                                     className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium text-sm"
//                                 >
//                                     <XCircle className="w-4 h-4" />
//                                     Decline
//                                 </button>
//                             </>
//                         )}
                        
//                         {consultation.status === 'accepted' && (
//                             <>
//                                 <button
//                                     onClick={() => handleAction(consultation.id, 'start')}
//                                     className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 font-medium text-sm"
//                                 >
//                                     <Video className="w-4 h-4" />
//                                     Start Call
//                                 </button>
//                                 <button className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
//                                     <MessageCircle className="w-4 h-4" />
//                                 </button>
//                             </>
//                         )}

//                         {consultation.status === 'reschedule_pending' && (
//                             <>
//                                 <button
//                                     onClick={() => handleAction(consultation.id, 'accept')}
//                                     className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium text-sm"
//                                 >
//                                     <CheckCircle className="w-4 h-4" />
//                                     Approve New Time
//                                 </button>
//                                 <button
//                                     onClick={() => handleAction(consultation.id, 'reject')}
//                                     className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium text-sm"
//                                 >
//                                     <XCircle className="w-4 h-4" />
//                                     Keep Original
//                                 </button>
//                             </>
//                         )}

//                         {consultation.status === 'completed' && (
//                             <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium text-sm">
//                                 <Eye className="w-4 h-4" />
//                                 View Details
//                             </button>
//                         )}
//                     </div>
//                 )}
//             </div>
//         )
//     }

//     // ✅ LOADING STATE
//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//                     <p className="mt-4 text-gray-600">Loading your consultations...</p>
//                 </div>
//             </div>
//         )
//     }

//     return (
//         <div className="min-h-screen bg-gray-50/30">
//             <div className="max-w-7xl mx-auto space-y-8 p-6">
                
//                 {/* 🔍 HEADER WITH STATS */}
//                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//                     <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
//                         <div className="flex-1">
//                             <h1 className="text-3xl font-bold text-[#1976D2]">My Consultations</h1>
//                             <p className="text-gray-600 mt-1">Manage your patient consultations efficiently</p>
//                         </div>
//                     </div>

//                     {/* 📊 QUICK STATS */}
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
//                         <div 
//                             className={`rounded-lg p-4 border transition-all duration-200 cursor-pointer ${
//                                 activeTab === 'pending' 
//                                     ? 'bg-blue-50 border-blue-200 shadow-sm ring-2 ring-blue-200' 
//                                     : 'bg-blue-50 border-blue-100 hover:border-blue-200'
//                             }`}
//                             onClick={() => setActiveTab('pending')}
//                         >
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-sm font-medium text-blue-700">Pending</p>
//                                     <p className="text-2xl font-bold text-blue-900 mt-1">{pendingConsultations.length}</p>
//                                     <p className="text-xs text-blue-600 mt-1">
//                                         Awaiting your action
//                                     </p>
//                                 </div>
//                                 <Clock className="w-8 h-8 text-blue-600" />
//                             </div>
//                         </div>
                        
//                         <div 
//                             className={`rounded-lg p-4 border transition-all duration-200 cursor-pointer ${
//                                 activeTab === 'in-progress' 
//                                     ? 'bg-green-50 border-green-200 shadow-sm ring-2 ring-green-200' 
//                                     : 'bg-green-50 border-green-100 hover:border-green-200'
//                             }`}
//                             onClick={() => setActiveTab('in-progress')}
//                         >
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-sm font-medium text-green-700">In Progress</p>
//                                     <p className="text-2xl font-bold text-green-900 mt-1">{inProgressConsultations.length}</p>
//                                     <p className="text-xs text-green-600 mt-1">
//                                         Active consultations
//                                     </p>
//                                 </div>
//                                 <PlayCircle className="w-8 h-8 text-green-600" />
//                             </div>
//                         </div>
                        
//                         <div 
//                             className={`rounded-lg p-4 border transition-all duration-200 cursor-pointer ${
//                                 activeTab === 'completed' 
//                                     ? 'bg-gray-50 border-gray-200 shadow-sm ring-2 ring-gray-200' 
//                                     : 'bg-gray-50 border-gray-100 hover:border-gray-200'
//                             }`}
//                             onClick={() => setActiveTab('completed')}
//                         >
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-sm font-medium text-gray-700">Completed</p>
//                                     <p className="text-2xl font-bold text-gray-900 mt-1">{completedConsultations.length}</p>
//                                     <p className="text-xs text-gray-600 mt-1">
//                                         Past consultations
//                                     </p>
//                                 </div>
//                                 <CheckCircle className="w-8 h-8 text-gray-600" />
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* 🔍 SEARCH BAR - MOVED BELOW THE HEADER */}
//                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//                     <div className="flex flex-col sm:flex-row gap-4 w-full">
//                         <div className="relative flex-1 sm:max-w-md">
//                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                 <Search className="h-5 w-5 text-gray-400" />
//                             </div>
//                             <input
//                                 type="text"
//                                 placeholder="Search patients, status..."
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                                 className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 placeholder-gray-500 text-sm"
//                             />
//                         </div>
//                         <div className="flex items-center gap-4">
//                             <button
//                                 onClick={() => setShowFilters(!showFilters)}
//                                 className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-gray-700 font-medium text-sm"
//                             >
//                                 <Filter className="w-4 h-4" />
//                                 Filters
//                             </button>
//                         </div>
//                     </div>

//                     {/* Filters Dropdown */}
//                     {showFilters && (
//                         <div className="mt-4 flex flex-wrap gap-4">
//                             <select
//                                 value={statusFilter}
//                                 onChange={(e) => setStatusFilter(e.target.value)}
//                                 className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
//                             >
//                                 <option value="all">All Statuses</option>
//                                 <option value="pending">Pending</option>
//                                 <option value="reschedule_pending">Reschedule Pending</option>
//                                 <option value="accepted">Accepted</option>
//                                 <option value="rescheduled">Rescheduled</option>
//                                 <option value="completed">Completed</option>
//                                 <option value="cancelled">Cancelled</option>
//                                 <option value="rejected">Rejected</option>
//                             </select>
//                         </div>
//                     )}
//                 </div>

//                 {/* 📝 MAIN CONTENT */}
//                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//                     {/* TAB HEADER */}
//                     <div className="border-b border-gray-200">
//                         <div className="flex items-center justify-between p-6">
//                             <div className="flex items-center gap-4">
//                                 <div className={`p-3 rounded-xl ${
//                                     activeTab === 'pending' ? 'bg-blue-50' :
//                                     activeTab === 'in-progress' ? 'bg-green-50' : 'bg-gray-50'
//                                 }`}>
//                                     {activeTab === 'pending' && <Clock className="w-6 h-6 text-blue-600" />}
//                                     {activeTab === 'in-progress' && <PlayCircle className="w-6 h-6 text-green-600" />}
//                                     {activeTab === 'completed' && <CheckCircle className="w-6 h-6 text-gray-600" />}
//                                 </div>
//                                 <div>
//                                     <h2 className="text-2xl font-bold text-gray-900">
//                                         {activeTab === 'pending' && 'Pending Consultations'}
//                                         {activeTab === 'in-progress' && 'In-Progress Consultations'}
//                                         {activeTab === 'completed' && 'Completed Consultations'}
//                                     </h2>
//                                     <p className="text-gray-600 mt-1">
//                                         {activeTab === 'pending' && 'Consultations awaiting your approval or action'}
//                                         {activeTab === 'in-progress' && 'Active and upcoming consultations'}
//                                         {activeTab === 'completed' && 'Your consultation history'}
//                                     </p>
//                                 </div>
//                             </div>
//                             <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-lg font-semibold">
//                                 {filteredData.length}
//                             </div>
//                         </div>
//                     </div>

//                     {/* CONTENT */}
//                     <div className="p-6">
//                         {filteredData.length > 0 ? (
//                             <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
//                                 {filteredData.map((consultation) => (
//                                     <ConsultationCard 
//                                         key={consultation.id} 
//                                         consultation={consultation}
//                                         showActions={activeTab !== 'completed'}
//                                     />
//                                 ))}
//                             </div>
//                         ) : (
//                             <div className="text-center py-16">
//                                 <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
//                                     {activeTab === 'pending' && <Clock className="w-12 h-12 text-gray-400" />}
//                                     {activeTab === 'in-progress' && <PlayCircle className="w-12 h-12 text-gray-400" />}
//                                     {activeTab === 'completed' && <CheckCircle className="w-12 h-12 text-gray-400" />}
//                                 </div>
//                                 <h3 className="text-2xl font-bold text-gray-900 mb-2">
//                                     {activeTab === 'pending' && 'No Pending Consultations'}
//                                     {activeTab === 'in-progress' && 'No Active Consultations'}
//                                     {activeTab === 'completed' && 'No Completed Consultations'}
//                                 </h3>
//                                 <p className="text-gray-600 text-lg">
//                                     {activeTab === 'pending' && 'All consultations have been processed'}
//                                     {activeTab === 'in-progress' && 'No active consultations at the moment'}
//                                     {activeTab === 'completed' && 'Your completed consultations will appear here'}
//                                 </p>
//                                 {searchTerm && (
//                                     <button
//                                         onClick={() => setSearchTerm('')}
//                                         className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200 font-semibold"
//                                     >
//                                         Clear Search
//                                     </button>
//                                 )}
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }