'use client'

import { useState, useEffect } from 'react'
import {
  User,
  Stethoscope,
  Users,
  FileText,
  Bell,
  LogOut,
  CheckCircle,
  Trash2,
  RefreshCw,
  HeartPulse
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const supabase = createClient()

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)

    // 1️⃣ Fetch base user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')

    if (profilesError) {
      toast.error('Failed to fetch users.')
      setLoading(false)
      return
    }

    let allUsers = profiles || []

    // 2️⃣ Fetch related profiles for active status
    const [doctorData, patientData, donorData] = await Promise.all([
      supabase.from('doctor_profiles').select('user_id, is_active, verified'),
      supabase.from('patient_profiles').select('user_id, is_active'),
      supabase.from('donor_profiles').select('user_id, is_active')
    ])

    if (doctorData.error || patientData.error || donorData.error) {
      toast.error('Failed to fetch related profiles.')
      setLoading(false)
      return
    }

    // 3️⃣ Merge statuses
    allUsers = allUsers.map(user => {
      if (user.role === 'DOCTOR') {
        const doc = doctorData.data.find(d => d.user_id === user.id)
        return { ...user, is_active: doc?.is_active ?? true, verified: doc?.verified ?? false }
      }
      if (user.role === 'PATIENT') {
        const pat = patientData.data.find(p => p.user_id === user.id)
        return { ...user, is_active: pat?.is_active ?? true }
      }
      if (user.role === 'DONOR') {
        const don = donorData.data.find(d => d.user_id === user.id)
        return { ...user, is_active: don?.is_active ?? true }
      }
      return { ...user, is_active: true }
    })

    setUsers(allUsers)
    setLoading(false)
  }

  // 🔴 Logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) toast.error('Failed to logout')
    else router.push('/')
  }

  // ✅ Verify Doctor
  const verifyDoctor = async (id: string) => {
    const { error } = await supabase
      .from('doctor_profiles')
      .update({ verified: true })
      .eq('user_id', id)

    if (error) return toast.error('Failed to verify doctor.')

    setUsers(users.map(u => (u.id === id ? { ...u, verified: true } : u)))
    toast.success('Doctor verified successfully!')
  }

  // 🔁 Change Role
  const changeRole = async (id: string, newRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', id)

    if (error) return toast.error('Failed to update role.')

    setUsers(users.map(u => (u.id === id ? { ...u, role: newRole } : u)))
    toast.success('Role updated successfully!')
  }

  // ⚠️ Confirm Deactivation
  const confirmDeactivate = (user: any) => {
    setSelectedUser(user)
    setModalOpen(true)
  }

  // 📴 Deactivate user by role
  const deactivateUser = async () => {
    if (!selectedUser) return
    let table = null

    if (selectedUser.role === 'DOCTOR') table = 'doctor_profiles'
    else if (selectedUser.role === 'PATIENT') table = 'patient_profiles'
    else if (selectedUser.role === 'DONOR') table = 'donor_profiles'

    if (table) {
      const { error } = await supabase
        .from(table)
        .update({ is_active: false, updated_at: new Date() })
        .eq('user_id', selectedUser.id)

      if (error) return toast.error('Failed to deactivate user.')
    }

    setUsers(users.map(u => (u.id === selectedUser.id ? { ...u, is_active: false } : u)))
    toast.success(`${selectedUser.full_name} deactivated successfully!`)
    setModalOpen(false)
  }

  // 🔄 Reactivate user by role
  const reactivateUser = async (user: any) => {
    let table = null

    if (user.role === 'DOCTOR') table = 'doctor_profiles'
    else if (user.role === 'PATIENT') table = 'patient_profiles'
    else if (user.role === 'DONOR') table = 'donor_profiles'

    if (table) {
      const { error } = await supabase
        .from(table)
        .update({ is_active: true, updated_at: new Date() })
        .eq('user_id', user.id)

      if (error) return toast.error('Failed to reactivate user.')
    }

    setUsers(users.map(u => (u.id === user.id ? { ...u, is_active: true } : u)))
    toast.success(`${user.full_name} reactivated successfully!`)
  }

  // ✅ UI
  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage Doctors, Patients & Donors</p>
            </div>
          </div>
          <LogOut className="w-6 h-6 text-red-500 cursor-pointer" onClick={handleLogout} />
        </div>
      </header>

      {/* Main */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 px-6 py-8">
        {/* Sidebar */}
        <nav className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6">
          {['overview', 'users'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-3 transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 ${
                activeTab === tab ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-600'
              }`}
            >
              {tab === 'overview' ? <FileText className="w-5 h-5" /> : <Users className="w-5 h-5" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { title: 'Total Doctors', value: users.filter(u => u.role === 'DOCTOR').length, icon: Stethoscope },
                { title: 'Total Patients', value: users.filter(u => u.role === 'PATIENT').length, icon: Users },
                { title: 'Total Donors', value: users.filter(u => u.role === 'DONOR').length, icon: HeartPulse },
                { title: 'Verified Doctors', value: users.filter(u => u.verified).length, icon: CheckCircle }
              ].map((card, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-md flex items-center gap-4 hover:shadow-xl transition">
                  <card.icon className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-gray-500">{card.title}</p>
                    <p className="text-2xl font-bold">{card.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Users */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">All Users</h2>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <ul className="space-y-3">
                  {users.map(user => (
                    <li key={user.id} className="flex justify-between items-center p-4 border rounded-xl bg-gray-50">
                      <div>
                        <span className="font-medium text-gray-800">{user.full_name}</span>{' '}
                        <span className="text-gray-500 text-sm">({user.role})</span>
                        {user.verified && <span className="text-green-600 ml-2 font-semibold">(Verified)</span>}
                        {!user.is_active && <span className="text-red-600 ml-2 font-semibold">(Deactivated)</span>}
                      </div>

                      <div className="flex items-center gap-2">
                        {user.role === 'DOCTOR' && !user.verified && user.is_active && (
                          <button
                            onClick={() => verifyDoctor(user.id)}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" /> Verify
                          </button>
                        )}

                        <select
                          value={user.role}
                          onChange={e => changeRole(user.id, e.target.value)}
                          className="border rounded-xl px-2 py-1 text-gray-700"
                        >
                          <option value="DOCTOR">Doctor</option>
                          <option value="PATIENT">Patient</option>
                          <option value="DONOR">Donor</option>
                          <option value="ADMIN">Admin</option>
                        </select>

                        {user.is_active ? (
                          <button
                            onClick={() => confirmDeactivate(user)}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" /> Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => reactivateUser(user)}
                            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-1"
                          >
                            <RefreshCw className="w-4 h-4" /> Reactivate
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Confirm Deactivation</h3>
            <p className="mb-6">
              Are you sure you want to deactivate <strong>{selectedUser?.full_name}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border">
                Cancel
              </button>
              <button
                onClick={deactivateUser}
                className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
