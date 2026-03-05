'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

const supabase = createClient()

interface ConsultationListProps {
  doctorId: string
  joinSession?: (consultationId: string) => void
  isActive: boolean
}

export default function ConsultationList({ doctorId, joinSession, isActive }: ConsultationListProps) {
  const [consultations, setConsultations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch consultations for this doctor
  useEffect(() => {
    if (!doctorId) return

    const fetchConsultations = async () => {
      setLoading(true)
      try {
        // Step 1: fetch consultations for this doctor
        const { data: consultationsData, error: consErr } = await supabase
          .from('consultations')
          .select('id, scheduled_time, status, patient_id')
          .eq('doctor_id', doctorId)

        if (consErr) throw consErr
        if (!consultationsData) return setConsultations([])

        // Step 2: fetch patient info
        const patientIds = consultationsData.map(c => c.patient_id)
        const { data: patients, error: patientsErr } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', patientIds)

        if (patientsErr) throw patientsErr

        // Step 3: merge consultations with patient info
        const merged = consultationsData.map(c => ({
          ...c,
          patient: patients.find(p => p.id === c.patient_id)
        }))

        setConsultations(merged)
      } catch (err: any) {
        console.error('Error fetching consultations:', err)
        toast.error('Failed to fetch consultations')
      } finally {
        setLoading(false)
      }
    }

    fetchConsultations()
  }, [doctorId])

  // Handle accept/reject
  const handleResponse = async (id: string, status: 'accepted' | 'rejected') => {
    if (!isActive) {
      toast('Your account is deactivated. Cannot update consultations.')
      return
    }

    console.log('Updating consultation:', id, status)

    try {
      const { error, data } = await supabase
        .from('consultations')
        .update({ status })
        .eq('id', id)
        .eq('doctor_id', doctorId) // ensure doctor can only update their own consultations

      if (error) {
        console.error('Supabase update error:', error)
        toast.error(`Failed to update status: ${error.message}`)
        return
      }

      toast.success(`Consultation ${status}`)
      setConsultations(prev =>
        prev.map(c => (c.id === id ? { ...c, status } : c))
      )
    } catch (err: any) {
      console.error('Unexpected error updating consultation:', err)
      toast.error('Failed to update status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading)
    return <p className="text-gray-500 text-center py-10">Loading consultations...</p>

  return (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-3xl mx-auto">
      <h3 className="text-2xl font-semibold mb-6 text-[#1976D2] text-center">
        Consultation Requests
      </h3>

      {consultations.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No consultation requests found.</p>
      ) : (
        <ul className="space-y-4">
          {consultations.map(c => (
            <li
              key={c.id}
              className="flex flex-col md:flex-row justify-between items-start md:items-center border border-gray-200 p-5 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-gray-800">{c.patient?.full_name || 'Unknown'}</p>
                <p className="text-sm text-gray-500">{new Date(c.scheduled_time).toLocaleString()}</p>
                <span className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(c.status)}`}>
                  {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                </span>
              </div>

              <div className="flex gap-3 mt-3 md:mt-0">
                {c.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleResponse(c.id, 'accepted')}
                      className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleResponse(c.id, 'rejected')}
                      className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
