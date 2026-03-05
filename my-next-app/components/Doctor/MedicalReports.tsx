// components/Doctor/MedicalReports.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    FileText,
    Download,
    Search,
    Eye,
    Microscope,
    AlertCircle,
    CheckCircle,
    Clock,
    ChevronRight,
    User,
    TrendingUp,
    Target,
    Zap,
    Brain,
    Database,
    LineChart,
    Copy,
    Hash,
    Info,
    Scan,
    FileSpreadsheet
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const supabase = createClient()

interface BloodSmearReport {
    id: string
    image_name: string
    diagnosis: string
    confidence: number
    created_at: string
    analysis_mode: string
    processing_time: number
    image_stats: any
    probabilities: any
    analysis_notes: string[]
    mm_detection_score?: number
    mm_indicators?: string[]
    correction_applied?: boolean
    patient_name?: string
    patient_age?: number
    patient_gender?: string
}

export default function MedicalReports() {
    const [reports, setReports] = useState<BloodSmearReport[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [dateFilter, setDateFilter] = useState('all')
    const [diagnosisFilter, setDiagnosisFilter] = useState('all')
    const [sortBy, setSortBy] = useState('date')
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
    const [selectedReport, setSelectedReport] = useState<BloodSmearReport | null>(null)
    const [showDetailsModal, setShowDetailsModal] = useState(false)

    useEffect(() => {
        fetchReports()
    }, [])

    const fetchReports = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('blood_smear_diagnoses')
                .select('*')
                .eq('doctor_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setReports(data || [])
        } catch (error) {
            console.error('Error fetching reports:', error)
            toast.error('Failed to load medical reports')
        } finally {
            setLoading(false)
        }
    }

    // Filter reports based on search and filters
    const filteredReports = reports.filter(report => {
        const matchesSearch =
            report.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.image_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (report.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesDiagnosis = diagnosisFilter === 'all' ||
            report.diagnosis.toLowerCase().includes(diagnosisFilter.toLowerCase())

        const reportDate = new Date(report.created_at)
        const now = new Date()
        const matchesDate = dateFilter === 'all' ||
            (dateFilter === 'today' && reportDate.toDateString() === now.toDateString()) ||
            (dateFilter === 'week' && (now.getTime() - reportDate.getTime()) < 7 * 24 * 60 * 60 * 1000) ||
            (dateFilter === 'month' && reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear())

        return matchesSearch && matchesDiagnosis && matchesDate
    })

    // Sort reports
    const sortedReports = [...filteredReports].sort((a, b) => {
        switch (sortBy) {
            case 'date':
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            case 'confidence':
                return b.confidence - a.confidence
            case 'name':
                return a.image_name.localeCompare(b.image_name)
            case 'diagnosis':
                return a.diagnosis.localeCompare(b.diagnosis)
            default:
                return 0
        }
    })

    const getDiagnosisColor = (diagnosis: string) => {
        if (diagnosis.includes('Normal') || diagnosis.includes('Healthy'))
            return 'bg-green-100 text-green-800'
        if (diagnosis.includes('Leukemia'))
            return 'bg-red-100 text-red-800'
        if (diagnosis.includes('Lymphoma'))
            return 'bg-orange-100 text-orange-800'
        if (diagnosis.includes('Myeloma'))
            return 'bg-purple-100 text-purple-800'
        if (diagnosis.includes('Anemia'))
            return 'bg-yellow-100 text-yellow-800'
        return 'bg-blue-100 text-blue-800'
    }

    const getSeverityColor = (confidence: number) => {
        if (confidence >= 90) return 'text-green-600 bg-green-50'
        if (confidence >= 80) return 'text-green-500 bg-green-50'
        if (confidence >= 70) return 'text-yellow-600 bg-yellow-50'
        if (confidence >= 60) return 'text-orange-600 bg-orange-50'
        return 'text-red-600 bg-red-50'
    }

    const getPriorityColor = (confidence: number) => {
        if (confidence >= 90) return 'border-l-4 border-green-500'
        if (confidence >= 80) return 'border-l-4 border-blue-500'
        if (confidence >= 70) return 'border-l-4 border-yellow-500'
        if (confidence >= 60) return 'border-l-4 border-orange-500'
        return 'border-l-4 border-red-500'
    }

    const getConfidenceIcon = (confidence: number) => {
        if (confidence >= 90) return <CheckCircle className="w-4 h-4 text-green-500" />
        if (confidence >= 80) return <TrendingUp className="w-4 h-4 text-blue-500" />
        if (confidence >= 70) return <AlertCircle className="w-4 h-4 text-yellow-500" />
        return <AlertCircle className="w-4 h-4 text-red-500" />
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - date.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return 'Today'
        if (diffDays === 1) return 'Yesterday'
        if (diffDays < 7) return `${diffDays} days ago`
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const downloadReport = (report: BloodSmearReport) => {
        const reportData = {
            'HemaAI Medical Report': {
                'Report ID': report.id,
                'Image Analyzed': report.image_name,
                'Patient Name': report.patient_name || 'Not specified',
                'Patient Age': report.patient_age || 'Not specified',
                'Patient Gender': report.patient_gender || 'Not specified',
                'Analysis Date': new Date(report.created_at).toLocaleString(),
                'Primary Diagnosis': report.diagnosis,
                'Confidence Level': `${report.confidence}%`,
                'Multiple Myeloma Detection Score': report.mm_detection_score ? `${report.mm_detection_score}/100` : 'N/A',
                'MM Indicators': report.mm_indicators || [],
                'Smart Correction Applied': report.correction_applied ? 'Yes' : 'No',
                'Analysis Mode': report.analysis_mode?.replace(/_/g, ' ') || 'AI Analysis',
                'Processing Time': `${report.processing_time}s`,
                'Image Quality Metrics': report.image_stats || {},
                'Disease Probabilities': report.probabilities || {},
                'Clinical Findings': report.analysis_notes || [],
                'Recommendations': getRecommendations(report.diagnosis),
                'Laboratory': 'HemaAI Digital Pathology',
                'Technologist': 'AI Diagnostic System',
                'Report Generated': new Date().toLocaleString()
            }
        }

        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `HemaAI_Report_${report.diagnosis.replace(/\s+/g, '_')}_${report.id.slice(-8)}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast.success('Medical report downloaded successfully')
    }

    const getRecommendations = (diagnosis: string) => {
        if (diagnosis.includes('Myeloma')) {
            return [
                'Urgent hematology consultation recommended',
                'Serum protein electrophoresis required',
                'Bone marrow biopsy advised',
                'Monitor renal function and calcium levels'
            ]
        }
        if (diagnosis.includes('Leukemia')) {
            return [
                'Complete blood count with differential',
                'Peripheral blood smear review',
                'Flow cytometry recommended',
                'Consider bone marrow examination'
            ]
        }
        if (diagnosis.includes('Lymphoma')) {
            return [
                'Lymph node biopsy recommended',
                'CT scan of chest/abdomen/pelvis',
                'PET-CT scan for staging',
                'Hematology/oncology referral'
            ]
        }
        return [
            'Routine follow-up advised',
            'Repeat test in 3-6 months if symptomatic',
            'Monitor for any new symptoms'
        ]
    }

    const viewDetailedReport = (report: BloodSmearReport) => {
        setSelectedReport(report)
        setShowDetailsModal(true)
    }

    const copyReportId = (reportId: string) => {
        navigator.clipboard.writeText(reportId)
        toast.success('Report ID copied to clipboard')
    }

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6 bg-gray-50 min-h-screen">

            {/* HEADER */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl shadow-blue-500/5">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 animate-blueShift rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                                <FileSpreadsheet className="w-8 h-8 text-white" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-4 border-white flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-[#1976D2]">
                                Medical Reports Dashboard
                            </h1>
                            <p className="text-gray-600 text-lg mt-1 flex items-center gap-2">
                                Advanced microscopic image analysis for hematological disorders
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* FILTERS & STATS BAR */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by patient, diagnosis, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                        />
                    </div>

                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
                    >
                        <option value="all">📅 All Dates</option>
                        <option value="today">📅 Today</option>
                        <option value="week">📅 This Week</option>
                        <option value="month">📅 This Month</option>
                    </select>

                    <select
                        value={diagnosisFilter}
                        onChange={(e) => setDiagnosisFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
                    >
                        <option value="all">🏥 All Diagnoses</option>
                        <option value="normal">✅ Normal</option>
                        <option value="leukemia">🩸 Leukemia</option>
                        <option value="lymphoma">🩸 Lymphoma</option>
                        <option value="myeloma">🩸 Myeloma</option>
                        <option value="anemia">🩸 Anemia</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
                    >
                        <option value="date">📅 Sort by Date</option>
                        <option value="confidence">📈 Sort by Confidence</option>
                        <option value="name">👤 Sort by Name</option>
                        <option value="diagnosis">🏥 Sort by Diagnosis</option>
                    </select>
                </div>

                {/* QUICK STATS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Reports</p>
                                <p className="text-2xl font-bold text-blue-700">{reports.length}</p>
                            </div>
                            <Database className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">High Confidence</p>
                                <p className="text-2xl font-bold text-green-700">
                                    {reports.filter(r => r.confidence >= 90).length}
                                </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Critical Cases</p>
                                <p className="text-2xl font-bold text-red-700">
                                    {reports.filter(r => r.confidence < 70).length}
                                </p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Avg. Confidence</p>
                                <p className="text-2xl font-bold text-purple-700">
                                    {reports.length > 0 ? Math.round(reports.reduce((acc, r) => acc + r.confidence, 0) / reports.length) : 0}%
                                </p>
                            </div>
                            <LineChart className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* REPORTS TABLE */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* TABLE HEADER */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
                        <div className="col-span-4">PATIENT & DIAGNOSIS</div>
                        <div className="col-span-2">CONFIDENCE</div>
                        <div className="col-span-3">ANALYSIS DETAILS</div>
                        <div className="col-span-3 text-right">ACTIONS</div>
                    </div>
                </div>

                {/* TABLE BODY */}
                <div className="divide-y divide-gray-100">
                    {sortedReports.length > 0 ? sortedReports.map((report) => (
                        <div
                            key={report.id}
                            className={`px-6 py-4 hover:bg-blue-50/30 transition-all ${getPriorityColor(report.confidence)}`}
                        >
                            <div className="grid grid-cols-12 gap-4 items-center">
                                {/* PATIENT & DIAGNOSIS */}
                                <div className="col-span-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${getDiagnosisColor(report.diagnosis)}`}>
                                            <Microscope className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-gray-900 truncate">
                                                    {report.patient_name || report.image_name}
                                                </p>
                                                {report.patient_age && (
                                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                        {report.patient_age}y
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 truncate">{report.diagnosis}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Clock className="w-3 h-3 text-gray-400" />
                                                <span className="text-xs text-gray-500">{formatDate(report.created_at)}</span>
                                                <Hash className="w-3 h-3 text-gray-400" />
                                                <span
                                                    className="text-xs text-gray-500 cursor-pointer hover:text-blue-600"
                                                    onClick={() => copyReportId(report.id)}
                                                    title="Click to copy"
                                                >
                                                    {report.id.slice(-8)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* CONFIDENCE */}
                                <div className="col-span-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(report.confidence)}`}>
                                            {report.confidence}%
                                        </div>
                                        {getConfidenceIcon(report.confidence)}
                                    </div>
                                </div>

                                {/* ANALYSIS DETAILS */}
                                <div className="col-span-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Zap className="w-3 h-3 text-gray-400" />
                                            <span className="text-gray-600">{report.processing_time}s processing</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Brain className="w-3 h-3 text-gray-400" />
                                            <span className="text-gray-600">
                                                {report.analysis_mode?.replace(/_/g, ' ') || 'AI Analysis'}
                                            </span>
                                        </div>
                                        {report.mm_detection_score !== undefined && report.mm_detection_score > 0 && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Target className="w-3 h-3 text-purple-400" />
                                                <span className="text-purple-600 font-medium">
                                                    MM Score: {report.mm_detection_score}/100
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* ACTIONS */}
                                <div className="col-span-3">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => viewDetailedReport(report)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm"
                                        >
                                            <Eye className="w-3 h-3" />
                                            View
                                        </button>
                                        <button
                                            onClick={() => downloadReport(report)}
                                            className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                            title="Download Report"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No Medical Reports Found
                            </h3>
                            <p className="text-gray-600 max-w-md mx-auto mb-6">
                                No reports match your current filters. Try adjusting your search criteria.
                            </p>
                            <button
                                onClick={() => {
                                    setSearchTerm('')
                                    setDateFilter('all')
                                    setDiagnosisFilter('all')
                                }}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* DETAILS MODAL */}
            {showDetailsModal && selectedReport && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Medical Report Details</h2>
                                <p className="text-gray-600">{selectedReport.diagnosis}</p>
                            </div>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* PATIENT INFO */}
                            <div className="bg-blue-50 p-4 rounded-xl">
                                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Patient Information
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Name</p>
                                        <p className="font-medium">{selectedReport.patient_name || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Age</p>
                                        <p className="font-medium">{selectedReport.patient_age || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Gender</p>
                                        <p className="font-medium">{selectedReport.patient_gender || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Report ID</p>
                                        <p className="font-medium font-mono">{selectedReport.id}</p>
                                    </div>
                                </div>
                            </div>

                            {/* DIAGNOSIS DETAILS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Diagnosis Summary</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-600">Primary Diagnosis</span>
                                            <span className={`font-semibold px-3 py-1 rounded-full ${getDiagnosisColor(selectedReport.diagnosis)}`}>
                                                {selectedReport.diagnosis}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-600">Confidence Level</span>
                                            <span className={`font-bold ${getSeverityColor(selectedReport.confidence)} px-3 py-1 rounded-full`}>
                                                {selectedReport.confidence}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-600">Analysis Date</span>
                                            <span>{new Date(selectedReport.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Technical Details</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-600">Processing Time</span>
                                            <span className="font-medium">{selectedReport.processing_time} seconds</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-600">Analysis Mode</span>
                                            <span className="font-medium">{selectedReport.analysis_mode?.replace(/_/g, ' ') || 'AI Analysis'}</span>
                                        </div>
                                        {selectedReport.mm_detection_score !== undefined && (
                                            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                                <span className="text-purple-700">Multiple Myeloma Score</span>
                                                <span className="font-bold text-purple-700">{selectedReport.mm_detection_score}/100</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* CLINICAL FINDINGS */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Clinical Findings</h3>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <ul className="space-y-2">
                                        {selectedReport.analysis_notes?.map((note, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <ChevronRight className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                                                <span className="text-gray-700">{note}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* RECOMMENDATIONS */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Recommendations</h3>
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <ul className="space-y-2">
                                        {getRecommendations(selectedReport.diagnosis).map((rec, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <Info className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                                                <span className="text-blue-800">{rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => downloadReport(selectedReport)}
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium"
                                >
                                    <Download className="w-5 h-5" />
                                    Download Full Report
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(JSON.stringify(selectedReport, null, 2))
                                        toast.success('Report copied to clipboard')
                                    }}
                                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2 font-medium"
                                >
                                    <Copy className="w-5 h-5" />
                                    Copy Report
                                </button>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition font-medium"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FOOTER STATS */}
            {reports.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics Overview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Leukemia Cases', value: reports.filter(r => r.diagnosis.includes('Leukemia')).length, color: 'red' },
                            { label: 'Lymphoma Cases', value: reports.filter(r => r.diagnosis.includes('Lymphoma')).length, color: 'orange' },
                            { label: 'Myeloma Cases', value: reports.filter(r => r.diagnosis.includes('Myeloma')).length, color: 'purple' },
                            { label: 'Normal Reports', value: reports.filter(r => r.diagnosis.includes('Normal')).length, color: 'green' }
                        ].map((stat, index) => (
                            <div key={index} className="text-center p-4 bg-gray-50 rounded-xl">
                                <div className={`text-2xl font-bold text-${stat.color}-600 mb-1`}>{stat.value}</div>
                                <div className="text-sm text-gray-600">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}