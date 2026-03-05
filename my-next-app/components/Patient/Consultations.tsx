// 'use client'

// import { useState, useEffect } from 'react'
// import { createClient } from '@/lib/supabase/client'
// import { 
//   Calendar, Shield, User, RefreshCw, 
//   Clock, PlayCircle, CheckCircle, 
//   Stethoscope, FileText
// } from 'lucide-react'
// import { toast } from 'react-hot-toast'

// const supabase = createClient()

// interface ConsultationsProps {
//   patientId?: string
//   isActive?: boolean
// }

// interface Doctor {
//   id: string
//   full_name: string
//   profile_picture_url?: string
//   specialization: string
//   qualifications: string
//   license_number: string
//   verified: boolean
//   is_active: boolean
//   contact?: string
// }

// interface ConsultationStats {
//   pending: number
//   inProgress: number
//   completed: number
//   total: number
// }

// export default function Consultations({ patientId, isActive = true }: ConsultationsProps) {
//   const [doctors, setDoctors] = useState<Doctor[]>([])
//   const [doctorId, setDoctorId] = useState('')
//   const [loadingDoctors, setLoadingDoctors] = useState(false)
//   const [submitting, setSubmitting] = useState(false)
//   const [userId, setUserId] = useState<string | null>(null)
//   const [consultationStats, setConsultationStats] = useState<ConsultationStats>({
//     pending: 0,
//     inProgress: 0,
//     completed: 0,
//     total: 0
//   })
//   const [loadingStats, setLoadingStats] = useState(false)
//   const [activeSection, setActiveSection] = useState<'book' | 'stats'>('book')

//   // Fetch current user
//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const { data: { user }, error } = await supabase.auth.getUser()
//         if (error) {
//           console.error('User fetch error:', error)
//           return
//         }
//         if (!user) {
//           toast.error('Please log in to book consultations')
//           return
//         }
//         setUserId(patientId || user.id)
//       } catch (error) {
//         console.error('Error fetching user:', error)
//       }
//     }
//     fetchUser()
//   }, [patientId])

//   // Fetch consultation statistics for the patient
//   const fetchConsultationStats = async () => {
//     if (!userId) return
    
//     setLoadingStats(true)
//     try {
//       const { data, error } = await supabase
//         .from('consultations')
//         .select('status')
//         .eq('patient_id', userId)

//       if (error) {
//         console.error('Error fetching consultation stats:', error)
//         return
//       }

//       const stats = {
//         pending: data.filter(c => c.status === 'pending' || c.status === 'reschedule_pending').length,
//         inProgress: data.filter(c => c.status === 'accepted' || c.status === 'rescheduled').length,
//         completed: data.filter(c => c.status === 'completed').length,
//         total: data.length
//       }

//       setConsultationStats(stats)
//     } catch (error) {
//       console.error('Error in fetchConsultationStats:', error)
//     } finally {
//       setLoadingStats(false)
//     }
//   }

//   // Fetch doctors with proper error handling - FIXED PROFILE PICTURE
//   const fetchDoctors = async () => {
//     setLoadingDoctors(true)
//     setDoctors([])
    
//     try {
//       const { data: profilesData, error: profilesError } = await supabase
//         .from('profiles')
//         .select('id, full_name, role')
//         .eq('role', 'DOCTOR')  

//       if (profilesError) {
//         console.error('Error fetching profiles:', profilesError)
//         throw new Error(`Failed to load doctors: ${profilesError.message}`)
//       }

//       if (!profilesData || profilesData.length === 0) {
//         toast.error('No doctors found in the system')
//         setDoctors([])
//         return
//       }

//       // Get doctor profiles - FIXED: Now we get profile_picture from doctor_profiles
//       const { data: doctorProfilesData, error: doctorProfilesError } = await supabase
//         .from('doctor_profiles')
//         .select('*')

//       if (doctorProfilesError) {
//         console.warn('Error fetching doctor_profiles:', doctorProfilesError)
//       }

//       // Combine data - FIXED: Using profile_picture from doctor_profiles
//       const combinedDoctors = profilesData.map(profile => {
//         const doctorProfile = doctorProfilesData?.find(dp => dp.user_id === profile.id) || {}
        
//         return {
//           id: profile.id,
//           full_name: profile.full_name || 'Unknown Doctor',
//           // FIX: Use profile_picture from doctor_profiles table
//           profile_picture_url: doctorProfile.profile_picture,
//           specialization: doctorProfile.specialization || 'General Practitioner',
//           qualifications: doctorProfile.qualifications || 'Medical Degree',
//           license_number: doctorProfile.license_number || 'License pending',
//           verified: doctorProfile.verified || false,
//           is_active: doctorProfile.is_active !== false,
//           contact: doctorProfile.contact
//         }
//       })

//       setDoctors(combinedDoctors)

//       if (combinedDoctors.length === 0) {
//         toast.error('No active doctors available')
//       }

//     } catch (error: any) {
//       console.error('❌ Error loading doctors:', error)
//       toast.error(error.message || 'Failed to load doctors list')
//     } finally {
//       setLoadingDoctors(false)
//     }
//   }

//   // Fetch doctors and stats on component mount
//   useEffect(() => {
//     fetchDoctors()
//   }, [])

//   // Fetch stats when userId changes
//   useEffect(() => {
//     if (userId) {
//       fetchConsultationStats()
//     }
//   }, [userId])

//   // Handle doctor selection
//   const handleDoctorSelect = (doctor: Doctor) => {
//     if (!doctor.is_active) {
//       toast.error('This doctor is not currently available')
//       return
//     }
//     setDoctorId(doctor.id)
//   }

//   // Handle consultation request
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()

//     if (!isActive) {
//       toast.error('Your account is deactivated. Cannot request consultation.')
//       return
//     }

//     if (!doctorId) {
//       toast.error('Please select a doctor first')
//       return
//     }

//     if (!userId) {
//       toast.error('User not found. Please log in again.')
//       return
//     }

//     const selectedDoctor = doctors.find(d => d.id === doctorId)
//     if (!selectedDoctor) {
//       toast.error('Selected doctor not found')
//       return
//     }

//     setSubmitting(true)
//     try {
//       // Schedule for 24 hours from now
//       const scheduledTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

//       const { data: newConsultation, error: insertErr } = await supabase
//         .from('consultations')
//         .insert([{
//           patient_id: userId,
//           doctor_id: doctorId,
//           scheduled_time: scheduledTime,
//           status: 'pending',
//           requested_time: new Date().toISOString()
//         }])
//         .select()
//         .single()

//       if (insertErr) {
//         console.error('❌ Consultation insert error:', insertErr)
//         throw new Error(`Failed to create consultation: ${insertErr.message}`)
//       }

//       toast.success(
//         `Consultation requested with Dr. ${selectedDoctor.full_name}!`,
//         { duration: 3000 }
//       )
      
//       // Reset form and refresh stats
//       setDoctorId('')
//       fetchConsultationStats()
//       setActiveSection('stats')

//     } catch (error: any) {
//       console.error('❌ Error requesting consultation:', error)
//       toast.error(error.message || 'Failed to request consultation')
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   const selectedDoctor = doctors.find(d => d.id === doctorId)

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto p-6 space-y-8">
        
//         {/* Header Section */}
//         <div className="text-center space-y-4">
//           <div className="flex items-center justify-center gap-3">
//             <div className="w-12 h-12 bg-[#1976D2] rounded-2xl flex items-center justify-center shadow-lg">
//               <Stethoscope className="w-6 h-6 text-white" />
//             </div>
//             <h1 className="text-3xl font-bold text-[#1976D2]">
//               Medical Consultations
//             </h1>
//           </div>
//           <p className="text-gray-600 max-w-2xl mx-auto">
//             Connect with healthcare professionals for medical advice
//           </p>
//         </div>

//         {/* Navigation Tabs */}
//         <div className="flex justify-center">
//           <div className="bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
//             <div className="flex space-x-1">
//               <button
//                 onClick={() => setActiveSection('book')}
//                 className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
//                   activeSection === 'book' 
//                     ? 'bg-[#1976D2] text-white shadow' 
//                     : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
//                 }`}
//               >
//                 <Calendar className="w-4 h-4" />
//                 Book Consultation
//               </button>
//               <button
//                 onClick={() => setActiveSection('stats')}
//                 className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
//                   activeSection === 'stats' 
//                     ? 'bg-[#1976D2] text-white shadow' 
//                     : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
//                 }`}
//               >
//                 <FileText className="w-4 h-4" />
//                 My Consultations
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="space-y-8">
          
//           {/* Book Consultation Section */}
//           {activeSection === 'book' && (
//             <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-[#1976D2] rounded-xl flex items-center justify-center">
//                     <Calendar className="w-5 h-5 text-white" />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-bold text-gray-900">Book New Consultation</h2>
//                     <p className="text-gray-600 text-sm">Select from available doctors</p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={fetchDoctors}
//                   disabled={loadingDoctors}
//                   className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:text-gray-400 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
//                 >
//                   <RefreshCw className={`w-4 h-4 ${loadingDoctors ? 'animate-spin' : ''}`} />
//                   Refresh
//                 </button>
//               </div>

//               {/* Selected Doctor Preview */}
//               {selectedDoctor && (
//                 <div className="mb-6 p-4 bg-[#E3F2FD] border border-[#90CAF9] rounded-xl">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       {selectedDoctor.profile_picture_url ? (
//                         <img 
//                           src={selectedDoctor.profile_picture_url} 
//                           alt={selectedDoctor.full_name}
//                           className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
//                         />
//                       ) : (
//                         <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold">
//                           {selectedDoctor.full_name?.charAt(0) || 'D'}
//                         </div>
//                       )}
//                       <div>
//                         <div className="flex items-center gap-2">
//                           <h3 className="font-semibold text-gray-900">Dr. {selectedDoctor.full_name}</h3>
//                           {selectedDoctor.verified && (
//                             <Shield className="w-4 h-4 text-green-500" />
//                           )}
//                         </div>
//                         <p className="text-blue-600 text-sm">{selectedDoctor.specialization}</p>
//                       </div>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => setDoctorId('')}
//                       className="text-red-500 hover:text-red-700 text-sm font-medium"
//                     >
//                       Change
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* Doctors Grid */}
//               <div className="mb-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="font-semibold text-gray-900">
//                     Available Doctors ({doctors.length})
//                   </h3>
//                   <span className="text-sm text-gray-500">
//                     {doctors.filter(d => d.is_active).length} active
//                   </span>
//                 </div>

//                 {loadingDoctors ? (
//                   <div className="text-center py-8">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
//                     <p className="text-gray-500 text-sm">Loading doctors...</p>
//                   </div>
//                 ) : doctors.length > 0 ? (
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">
//                     {doctors.map(doctor => (
//                       <div 
//                         key={doctor.id}
//                         className={`border rounded-lg p-4 transition-all cursor-pointer ${
//                           doctorId === doctor.id 
//                             ? 'border-blue-500 bg-blue-50 shadow-md' 
//                             : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
//                         } ${!doctor.is_active ? 'opacity-50 cursor-not-allowed' : ''}`}
//                         onClick={() => doctor.is_active && handleDoctorSelect(doctor)}
//                       >
//                         <div className="flex items-start gap-3">
//                           {doctor.profile_picture_url ? (
//                             <img 
//                               src={doctor.profile_picture_url} 
//                               alt={doctor.full_name}
//                               className="w-12 h-12 rounded-full object-cover border-2 border-white"
//                             />
//                           ) : (
//                             <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
//                               {doctor.full_name?.charAt(0) || 'D'}
//                             </div>
//                           )}
//                           <div className="flex-1 min-w-0">
//                             <div className="flex items-start justify-between mb-1">
//                               <div>
//                                 <h4 className="font-semibold text-gray-900 text-sm truncate">Dr. {doctor.full_name}</h4>
//                                 <p className="text-blue-600 text-xs">{doctor.specialization}</p>
//                               </div>
//                               {doctor.verified && (
//                                 <Shield className="w-3 h-3 text-green-500 flex-shrink-0 mt-1" />
//                               )}
//                             </div>
//                             <p className="text-gray-600 text-xs mb-2 line-clamp-2">
//                               {doctor.qualifications}
//                             </p>
//                             <div className="text-xs text-gray-500">
//                               License: {doctor.license_number}
//                             </div>
//                           </div>
//                         </div>

//                         {doctorId === doctor.id && (
//                           <div className="flex justify-center mt-3">
//                             <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
//                               <div className="w-2 h-2 bg-white rounded-full"></div>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
//                     <User className="w-12 h-12 text-gray-400 mx-auto mb-2" />
//                     <p className="text-gray-600 mb-2">No doctors available</p>
//                     <button
//                       onClick={fetchDoctors}
//                       className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
//                     >
//                       Try Again
//                     </button>
//                   </div>
//                 )}
//               </div>

//               {/* Submit Button */}
//               <form onSubmit={handleSubmit}>
//                 <button
//                   type="submit"
//                   disabled={!isActive || !doctorId || submitting || loadingDoctors}
//                   className="w-full bg-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-3"
//                 >
//                   {submitting ? (
//                     <>
//                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                       Processing...
//                     </>
//                   ) : !isActive ? (
//                     'Account Deactivated'
//                   ) : !doctorId ? (
//                     'Select a Doctor to Continue'
//                   ) : (
//                     `Book with Dr. ${selectedDoctor?.full_name}`
//                   )}
//                 </button>
//               </form>
//             </div>
//           )}

//           {/* Statistics Section */}
//           {activeSection === 'stats' && (
//             <div className="space-y-6">
//               {/* Statistics Overview */}
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                 {/* Total Consultations */}
//                 <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm font-medium text-gray-500">Total</p>
//                       <p className="text-2xl font-bold text-gray-900 mt-1">
//                         {loadingStats ? '...' : consultationStats.total}
//                       </p>
//                     </div>
//                     <div className="p-2 bg-blue-100 rounded-lg">
//                       <FileText className="w-5 h-5 text-blue-600" />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Pending Consultations */}
//                 <div className="bg-white rounded-xl shadow border border-yellow-200 p-4">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm font-medium text-yellow-700">Pending</p>
//                       <p className="text-2xl font-bold text-yellow-900 mt-1">
//                         {loadingStats ? '...' : consultationStats.pending}
//                       </p>
//                     </div>
//                     <div className="p-2 bg-yellow-100 rounded-lg">
//                       <Clock className="w-5 h-5 text-yellow-600" />
//                     </div>
//                   </div>
//                 </div>

//                 {/* In Progress Consultations */}
//                 <div className="bg-white rounded-xl shadow border border-blue-200 p-4">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm font-medium text-blue-700">In Progress</p>
//                       <p className="text-2xl font-bold text-blue-900 mt-1">
//                         {loadingStats ? '...' : consultationStats.inProgress}
//                       </p>
//                     </div>
//                     <div className="p-2 bg-blue-100 rounded-lg">
//                       <PlayCircle className="w-5 h-5 text-blue-600" />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Completed Consultations */}
//                 <div className="bg-white rounded-xl shadow border border-green-200 p-4">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm font-medium text-green-700">Completed</p>
//                       <p className="text-2xl font-bold text-green-900 mt-1">
//                         {loadingStats ? '...' : consultationStats.completed}
//                       </p>
//                     </div>
//                     <div className="p-2 bg-green-100 rounded-lg">
//                       <CheckCircle className="w-5 h-5 text-green-600" />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Action Card */}
//               <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="font-semibold text-gray-900">Need Another Consultation?</h3>
//                     <p className="text-gray-600 text-sm">Book with our healthcare experts</p>
//                   </div>
//                   <button
//                     onClick={() => setActiveSection('book')}
//                     className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
//                   >
//                     Book Now
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }