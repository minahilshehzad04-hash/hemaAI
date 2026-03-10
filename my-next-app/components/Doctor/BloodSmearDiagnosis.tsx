// components/Doctor/BloodSmearDiagnosis.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Microscope,
  Upload,
  AlertCircle,
  CheckCircle,
  Download,
  Sparkles,
  Zap,
  Shield,
  Brain,
  Target,
  BarChart3,
  Image as ImageIcon,
  RotateCcw,
  Eye,
  Scan,
  TestTube,
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const supabase = createClient()

export default function BloodSmearDiagnosis() {
  const [file, setFile] = useState<File | null>(null)
  const [diagnosis, setDiagnosis] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [analysisTime, setAnalysisTime] = useState<number>(0)
  const [useMockData, setUseMockData] = useState(false)
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  // Check server status
  useEffect(() => {
    const checkServerStatus = async () => {
      if (useMockData) {
        setServerStatus('online')
        return
      }

      try {
        const response = await fetch('http://localhost:8000/', {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        })
        setServerStatus(response.ok ? 'online' : 'offline')
      } catch {
        setServerStatus('offline')
      }
    }

    checkServerStatus()
    const interval = setInterval(checkServerStatus, 30000)
    return () => clearInterval(interval)
  }, [useMockData])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff']
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please select a valid medical image (JPEG, PNG, BMP, TIFF)')
        return
      }

      // Validate file size (max 15MB for high-quality medical images)
      if (selectedFile.size > 15 * 1024 * 1024) {
        setError('File size must be less than 15MB')
        return
      }

      setFile(selectedFile)
      setError('')
      setDiagnosis(null)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  // Enhanced Mock diagnosis data with MM detection
  const getMockDiagnosis = async (fileName: string) => {
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000))

    const conditions = [
      {
        diagnosis: "Multiple Myeloma",
        confidence: 87,
        mm_score: 76,
        mm_indicators: ["blue_purple_tint", "high_color_variance", "complex_texture"],
        correction_applied: true
      },
      {
        diagnosis: "Acute Leukemia",
        confidence: 92,
        mm_score: 45,
        mm_indicators: ["high_color_variance"],
        correction_applied: false
      },
      {
        diagnosis: "Normal Blood Cells",
        confidence: 95,
        mm_score: 20,
        mm_indicators: [],
        correction_applied: false
      },
      {
        diagnosis: "Chronic Leukemia",
        confidence: 78,
        mm_score: 35,
        mm_indicators: ["moderate_brightness"],
        correction_applied: false
      },
      {
        diagnosis: "Lymphoma CLL",
        confidence: 82,
        mm_score: 28,
        mm_indicators: [],
        correction_applied: false
      }
    ]

    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)]

    return {
      success: true,
      diagnosis: randomCondition.diagnosis,
      confidence: randomCondition.confidence,
      mm_detection_score: randomCondition.mm_score,
      mm_indicators: randomCondition.mm_indicators,
      correction_applied: randomCondition.correction_applied,
      probabilities: {
        "Acute Leukemia": randomCondition.diagnosis === "Acute Leukemia" ? randomCondition.confidence : Math.floor(Math.random() * 30),
        "Chronic Leukemia": randomCondition.diagnosis === "Chronic Leukemia" ? randomCondition.confidence : Math.floor(Math.random() * 25),
        "Multiple Myeloma": randomCondition.diagnosis === "Multiple Myeloma" ? randomCondition.confidence : Math.floor(Math.random() * 20),
        "Lymphoma CLL": randomCondition.diagnosis === "Lymphoma CLL" ? randomCondition.confidence : Math.floor(Math.random() * 15),
        "Lymphoma FL": Math.floor(Math.random() * 10),
        "Lymphoma MCL": Math.floor(Math.random() * 10),
        "Normal Blood Cells": randomCondition.diagnosis === "Normal Blood Cells" ? randomCondition.confidence : Math.floor(Math.random() * 35)
      },
      analysis_mode: "ai_model_with_smart_correction",
      processing_time_seconds: (Math.random() * 2) + 1.5,
      image_stats: {
        width: 1920,
        height: 1080,
        avg_brightness: (Math.random() * 100) + 80,
        color_variance: (Math.random() * 4000) + 2000,
        blue_dominance: randomCondition.diagnosis === "Multiple Myeloma" ? (Math.random() * 10) + 5 : (Math.random() * 6) - 2,
        total_pixels: 1920 * 1080
      },
      analysis_notes: [
        `Detected ${Math.floor(Math.random() * 100) + 50} white blood cells per field`,
        `Red blood cell morphology: ${randomCondition.diagnosis === "Multiple Myeloma" ? 'Abnormal plasma cells detected' : 'Normal'}`,
        `Cell staining quality: Excellent`,
        `Multiple Myeloma detection score: ${randomCondition.mm_score}/100`
      ]
    }
  }

  // Enhanced Real API call function
  // Enhanced Real API call function
  const performRealDiagnosis = async (file: File, user: any) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      console.log('🔬 Sending to HemaAI API...', {
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        type: file.type
      })

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch('http://localhost:8000/diagnose', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      console.log('🔍 API Response Status:', response.status, response.statusText)

      if (!response.ok) {
        let errorText = 'Unknown error'
        try {
          errorText = await response.text()
        } catch { }

        console.error('❌ API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })

        throw new Error(`Server error: ${response.status} - ${response.statusText}`)
      }

      // Try to parse JSON response
      let data
      try {
        data = await response.json()
        console.log('✅ API Response Data:', data)
      } catch (jsonError) {
        console.error('❌ JSON Parse Error:', jsonError)
        throw new Error('Invalid response from server')
      }

      // Check if response has success property
      if (data.success === false) {
        throw new Error(data.error || data.message || 'Analysis failed')
      }

      // If no success property, assume it's a successful response
      if (!data.success && !data.diagnosis && !data.result) {
        console.warn('⚠️ Response format unexpected, but processing:', data)
      }

      // Return normalized data
      return {
        success: true,
        ...data
      }
    } catch (error: any) {
      console.error('🚨 API Call Error:', error)

      if (error.name === 'AbortError') {
        throw new Error('Analysis timeout - server is not responding')
      }
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to diagnosis server. Please ensure the server is running on localhost:8000')
      }
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Connection failed. Please check if the HemaAI server is running.')
      }
      throw error
    }
  }

  const handleDiagnose = async () => {
    if (!file) {
      setError('Please select an image first')
      toast.error('Please select an image first')
      return
    }

    setLoading(true)
    setError('')
    setUploadProgress(0)
    const startTime = Date.now()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Please login to use this feature')
      }

      // Show server status before starting
      if (!useMockData && serverStatus !== 'online') {
        throw new Error('HemaAI server is offline. Please enable Demo Mode or start the server.')
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 85) {
            clearInterval(progressInterval)
            return 85
          }
          return prev + (85 / 8)
        })
      }, 300)

      let diagnosisData

      if (useMockData) {
        console.log('🎮 Using mock diagnosis data...')
        diagnosisData = await getMockDiagnosis(file.name)
      } else {
        console.log('🔬 Starting real diagnosis...')
        diagnosisData = await performRealDiagnosis(file, user)
      }

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Calculate analysis time
      const endTime = Date.now()
      const analysisDuration = (endTime - startTime) / 1000
      setAnalysisTime(analysisDuration)

      // Normalize the diagnosis data
      const normalizedDiagnosis = {
        success: diagnosisData.success !== false,
        diagnosis: diagnosisData.diagnosis || diagnosisData.result || 'Analysis Inconclusive',
        confidence: diagnosisData.confidence || diagnosisData.accuracy || 0,
        mm_detection_score: diagnosisData.mm_detection_score || diagnosisData.mm_score || 0,
        mm_indicators: diagnosisData.mm_indicators || [],
        correction_applied: diagnosisData.correction_applied || false,
        probabilities: diagnosisData.probabilities || {},
        analysis_mode: diagnosisData.analysis_mode || 'ai_model_analysis',
        processing_time_seconds: diagnosisData.processing_time_seconds || analysisDuration,
        image_stats: diagnosisData.image_stats || {},
        analysis_notes: diagnosisData.analysis_notes || diagnosisData.notes || []
      }

      // Normalize probabilities if they exist
      if (normalizedDiagnosis.probabilities && Object.keys(normalizedDiagnosis.probabilities).length > 0) {
        const total = Object.values(normalizedDiagnosis.probabilities).reduce((a: number, b: unknown) => a + (Number(b) || 0), 0)
        if (total > 0) {
          Object.keys(normalizedDiagnosis.probabilities).forEach(key => {
            normalizedDiagnosis.probabilities[key] = Math.round(((Number(normalizedDiagnosis.probabilities[key]) || 0) / total) * 100)
          })
        }
      }

      // Store in Supabase
      const insertData: any = {
        doctor_id: user.id,
        image_name: file.name,
        diagnosis: normalizedDiagnosis.diagnosis,
        confidence: normalizedDiagnosis.confidence,
        probabilities: normalizedDiagnosis.probabilities,
        analysis_mode: normalizedDiagnosis.analysis_mode,
        processing_time: normalizedDiagnosis.processing_time_seconds,
        image_stats: normalizedDiagnosis.image_stats,
        analysis_notes: normalizedDiagnosis.analysis_notes,
        clinical_notes: normalizedDiagnosis.analysis_notes?.join(', ') || 'AI Analysis Completed',
        created_at: new Date().toISOString(),
      };

      // Store in Supabase
      const { data: supabaseData, error: supabaseError } = await supabase
        .from('blood_smear_diagnoses')
        .insert([insertData])
        .select()

      if (supabaseError) {
        console.error('Supabase storage error:', supabaseError)
        toast.error('Analysis completed but failed to save record')
      } else {
        toast.success('Blood smear analysis completed and saved successfully!')
        console.log('💾 Saved to Supabase:', supabaseData)
      }

      setDiagnosis(normalizedDiagnosis)

    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      toast.error(`Diagnosis failed: ${message}`)
      console.error('🚨 Diagnosis error details:', {
        error: err,
        message,
        file: file?.name,
        useMockData,
        serverStatus
      })
    } finally {
      setLoading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const resetAnalysis = () => {
    setFile(null)
    setDiagnosis(null)
    setImagePreview(null)
    setError('')
    setUploadProgress(0)
  }

  const getDiagnosisColor = (diagnosis: string) => {
    if (diagnosis?.includes('Healthy') || diagnosis?.includes('Normal'))
      return 'text-green-600 bg-green-50 border-green-200'
    if (diagnosis?.includes('Leukemia') || diagnosis?.includes('Lymphoma') || diagnosis?.includes('Myeloma'))
      return 'text-red-600 bg-red-50 border-red-200'
    if (diagnosis?.includes('Anemia') || diagnosis?.includes('Infection'))
      return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-blue-600 bg-blue-50 border-blue-200'
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100'
    if (confidence >= 80) return 'text-yellow-600 bg-yellow-100'
    if (confidence >= 70) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getAnalysisModeColor = (mode: string) => {
    switch (mode) {
      case 'advanced_image_analysis': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ai_model': return 'bg-green-100 text-green-800 border-green-200'
      case 'ai_model_analysis': return 'bg-green-100 text-green-800 border-green-200'
      case 'ai_model_with_smart_correction': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'deep_learning': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'neural_network': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityLevel = (diagnosis: string) => {
    if (diagnosis?.includes('Healthy') || diagnosis?.includes('Normal')) return 'Low'
    if (diagnosis?.includes('Mild') || diagnosis?.includes('Early')) return 'Moderate'
    if (diagnosis?.includes('Acute') || diagnosis?.includes('Advanced')) return 'High'
    if (diagnosis?.includes('Leukemia') || diagnosis?.includes('Lymphoma') || diagnosis?.includes('Myeloma')) return 'Critical'
    return 'Unknown'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low': return 'text-green-600 bg-green-100'
      case 'Moderate': return 'text-yellow-600 bg-yellow-100'
      case 'High': return 'text-orange-600 bg-orange-100'
      case 'Critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const downloadReport = (diagnosisItem: any) => {
    const report = {
      'HemaAI Blood Smear Analysis Report': {
        'Patient ID': 'N/A',
        'Referring Physician': 'Dr. User',
        'Image Name': diagnosisItem.image_name,
        'Analysis Date': new Date().toLocaleString(),
        'Primary Diagnosis': diagnosisItem.diagnosis,
        'Confidence Level': `${diagnosisItem.confidence}%`,
        'Multiple Myeloma Detection Score': diagnosisItem.mm_detection_score ? `${diagnosisItem.mm_detection_score}/100` : 'N/A',
        'MM Indicators Detected': diagnosisItem.mm_indicators || [],
        'Smart Correction Applied': diagnosisItem.correction_applied ? 'Yes' : 'No',
        'Severity Assessment': getSeverityLevel(diagnosisItem.diagnosis),
        'Analysis Mode': diagnosisItem.analysis_mode?.replace(/_/g, ' ') || 'AI Analysis',
        'Processing Time': diagnosisItem.processing_time_seconds ? `${diagnosisItem.processing_time_seconds}s` : 'N/A',
        'Image Quality Metrics': diagnosisItem.image_stats || {},
        'Probability Distribution': diagnosisItem.probabilities,
        'Clinical Notes': diagnosisItem.analysis_notes || [],
        'Recommendations': [
          'Consult with hematology specialist',
          'Consider follow-up testing',
          'Monitor patient symptoms',
          diagnosisItem.diagnosis.includes('Myeloma') ? 'Urgent hematology referral recommended' : 'Routine follow-up advised'
        ],
        'Laboratory': 'HemaAI Digital Pathology',
        'Technologist': 'AI Diagnostic System',
        'Report Generated': new Date().toLocaleString()
      }
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `HemaAI_Blood_Report_${diagnosisItem.diagnosis.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Medical report downloaded successfully')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl shadow-blue-500/5">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 animate-blueShift rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Microscope className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#1976D2]">
                  AI Blood Smear Analysis
                </h1>
                <p className="text-gray-600 text-lg mt-1 flex items-center gap-2">
                  <Scan className="w-5 h-5 text-blue-500" />
                  Advanced microscopic image analysis for hematological disorders
                </p>
              </div>
            </div>

            {/* Quick Stats - Simplified */}
            <div className="flex items-center gap-4 bg-white/60 rounded-2xl p-4 border border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">AI</div>
                <div className="text-xs text-gray-500">Powered</div>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div className="text-center">
                <div className={`text-2xl font-bold ${loading ? 'text-yellow-600' : file ? 'text-green-600' : 'text-gray-400'}`}>
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : file ? '✓' : '--'}
                </div>
                <div className="text-xs text-gray-500">Ready</div>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div className="text-center">
                <div className={`text-2xl font-bold ${useMockData ? 'text-purple-600' : serverStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                  {useMockData ? 'Demo' : serverStatus === 'online' ? 'Live' : 'Off'}
                </div>
                <div className="text-xs text-gray-500">Mode</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Main Content - Full Width Now */}
          <div className="space-y-6">
            {/* Upload Card */}
            <div className="bg-white rounded-3xl shadow-xl shadow-blue-500/5 border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 animate-blueShift rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Upload Blood Smear Image</h2>
                    <p className="text-gray-600 text-sm">Get instant AI-powered analysis</p>
                  </div>
                </div>
                {file && (
                  <button
                    onClick={resetAnalysis}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all duration-200"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Area */}
                <div className="space-y-6">
                  <div className={`relative border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-300 group ${file
                    ? 'border-green-400 bg-green-50/50 shadow-lg shadow-green-500/10'
                    : 'border-gray-300 hover:border-blue-400 bg-gray-50/50 hover:shadow-2xl hover:shadow-blue-500/10'
                    }`}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      disabled={loading}
                    />
                    <label
                      htmlFor="file-upload"
                      className={`cursor-pointer flex flex-col items-center justify-center gap-4 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                      <div className={`w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${file
                        ? 'animate-blueShift text-white shadow-lg shadow-green-500/25'
                        : 'animate-blueShift text-white shadow-lg shadow-blue-500/25'
                        }`}>
                        {file ? <CheckCircle className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-700 mb-2">
                          {file ? 'Image Selected' : 'Choose Blood Smear Image'}
                        </p>
                        <p className="text-sm text-gray-500 mb-3">
                          {file ? file.name : 'Drag & drop or click to browse'}
                        </p>
                        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <ImageIcon className="w-4 h-4" />
                            JPEG, PNG, BMP, TIFF
                          </span>
                          <span>•</span>
                          <span>Max 15MB</span>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Server Status */}
                  <div className="flex items-center justify-between bg-gray-50/50 rounded-2xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${serverStatus === 'online' ? 'bg-green-500 animate-pulse' :
                        serverStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Server Status</p>
                        <p className="text-xs text-gray-600">
                          {serverStatus === 'online' ? 'HemaAI Server Connected' :
                            serverStatus === 'offline' ? 'Server Offline - Using Demo' : 'Checking...'}
                        </p>
                      </div>
                    </div>
                    {serverStatus === 'offline' && !useMockData && (
                      <button
                        onClick={() => setUseMockData(true)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Switch to Demo
                      </button>
                    )}
                  </div>

                  {uploadProgress > 0 && (
                    <div className="space-y-4 animate-blueShift rounded-2xl p-4 border border-blue-200">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span className="font-medium">Processing Image...</span>
                        <span className="font-bold">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                          className="animate-blueShift h-3 rounded-full transition-all duration-500 ease-out shadow-lg shadow-blue-500/25"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      {analysisTime > 0 && (
                        <p className="text-xs text-gray-500 text-center">
                          Analysis completed in {analysisTime.toFixed(1)} seconds
                        </p>
                      )}
                    </div>
                  )}

                  {error && (
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-red-800 font-semibold">Analysis Error</p>
                        <p className="text-red-600 text-sm mt-1">{error}</p>
                        {!useMockData && error.includes('localhost') && (
                          <p className="text-red-600 text-xs mt-2">
                            Tip: Enable Demo Mode to test with mock data, or ensure your diagnosis server is running on localhost:8000
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <button
                      onClick={handleDiagnose}
                      disabled={!file || loading}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-2xl hover:animate-blueShift disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 font-bold flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-0.5"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Analyzing Blood Smear...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span>Start AI Analysis</span>
                        </>
                      )}
                    </button>

                    {/* Demo Mode Toggle */}
                    <div className="flex items-center justify-between bg-gray-50/50 rounded-2xl p-4 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <TestTube className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Demo Mode</p>
                          <p className="text-xs text-gray-600">Use mock data for testing</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setUseMockData(!useMockData)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useMockData ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useMockData ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Image Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-blue-500" />
                      Image Preview
                    </h3>
                    {file && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        Ready for Analysis
                      </span>
                    )}
                  </div>
                  <div className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-white aspect-video flex items-center justify-center shadow-inner">
                    {imagePreview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={imagePreview}
                          alt="Blood smear preview"
                          className="w-full h-full object-contain p-2"
                        />
                        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
                          Preview
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 p-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Eye className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="text-sm font-medium">No image selected</p>
                        <p className="text-xs mt-1">Upload a blood smear image to begin</p>
                      </div>
                    )}
                  </div>
                  {file && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
                        <p className="text-xs text-blue-600 font-medium">File Size</p>
                        <p className="font-bold text-gray-900">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
                        <p className="text-xs text-purple-600 font-medium">Type</p>
                        <p className="font-bold text-gray-900">{file.type.split('/')[1]?.toUpperCase()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Results Card */}
            {diagnosis && (
              <div className="bg-white rounded-3xl shadow-xl shadow-blue-500/5 border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Analysis Results</h2>
                      <p className="text-gray-600 text-sm">AI-powered diagnostic insights</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {diagnosis.analysis_mode && (
                      <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getAnalysisModeColor(diagnosis.analysis_mode)}`}>
                        {diagnosis.analysis_mode.replace(/_/g, ' ')}
                      </span>
                    )}
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${getSeverityColor(getSeverityLevel(diagnosis.diagnosis))}`}>
                      {getSeverityLevel(diagnosis.diagnosis)} Severity
                    </span>
                    {useMockData && (
                      <span className="px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                        Demo Data
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Primary Diagnosis */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200 shadow-lg shadow-blue-500/10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center md:text-left">
                        <p className="text-sm text-blue-600 font-medium mb-2">Primary Diagnosis</p>
                        <p className={`text-2xl font-bold ${getDiagnosisColor(diagnosis.diagnosis).split(' ')[0]}`}>
                          {diagnosis.diagnosis}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-blue-600 font-medium mb-2">Confidence Level</p>
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-20 h-20 relative">
                            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                              <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                              <circle
                                cx="50" cy="50" r="40"
                                stroke={diagnosis.confidence >= 90 ? "#10b981" : diagnosis.confidence >= 80 ? "#f59e0b" : "#ef4444"}
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={251.2}
                                strokeDashoffset={251.2 * (1 - diagnosis.confidence / 100)}
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className={`absolute inset-0 flex items-center justify-center text-lg font-bold ${getConfidenceColor(diagnosis.confidence).split(' ')[0]}`}>
                              {diagnosis.confidence}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-center md:text-right">
                        <p className="text-sm text-blue-600 font-medium mb-2">Processing Time</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {diagnosis.processing_time_seconds || analysisTime.toFixed(1)}s
                        </p>
                        <p className="text-xs text-gray-600 mt-1">AI Analysis</p>
                      </div>
                    </div>
                  </div>

                  {/* Technical Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Image Statistics */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                        Image Metrics
                      </h4>
                      <div className="space-y-4">
                        {diagnosis.image_stats && (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Dimensions</span>
                              <span className="font-semibold text-gray-900">
                                {diagnosis.image_stats.width}×{diagnosis.image_stats.height}px
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Brightness</span>
                              <span className="font-semibold text-gray-900">{diagnosis.image_stats.avg_brightness?.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Color Variance</span>
                              <span className="font-semibold text-gray-900">{diagnosis.image_stats.color_variance?.toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Blue Dominance</span>
                              <span className="font-semibold text-gray-900">{diagnosis.image_stats.blue_dominance?.toFixed(2)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Analysis Notes */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 shadow-sm">
                      <h4 className="text-sm font-semibold text-blue-900 mb-4 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-blue-600" />
                        Analysis Insights
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-3">
                        {diagnosis.analysis_notes?.map((note: string, index: number) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="leading-relaxed">{note}</span>
                          </li>
                        )) || <li className="text-blue-700">No additional insights available</li>}
                      </ul>
                    </div>
                  </div>

                  {/* Probability Distribution */}
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-500" />
                      Probability Distribution
                    </h4>
                    <div className="space-y-4">
                      {Object.entries(diagnosis.probabilities).map(([condition, prob]) => {
                        const probValue = prob as number
                        return (
                          <div key={condition} className="flex items-center justify-between group hover:bg-white p-3 rounded-xl transition-all duration-200">
                            <span className={`text-sm flex-1 font-medium ${condition === diagnosis.diagnosis ? 'text-blue-700 font-bold' : 'text-gray-700'
                              }`}>
                              {condition}
                            </span>
                            <div className="flex items-center gap-4 flex-1 max-w-md">
                              <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                                <div
                                  className={`h-3 rounded-full transition-all duration-700 ${condition === diagnosis.diagnosis
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                                    : 'bg-gray-400'
                                    }`}
                                  style={{ width: `${probValue}%` }}
                                ></div>
                              </div>
                              <span className={`text-sm font-bold w-12 text-right ${condition === diagnosis.diagnosis ? 'text-blue-600' : 'text-gray-600'
                                }`}>
                                {probValue}%
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => downloadReport({
                        ...diagnosis,
                        image_name: file?.name || 'unknown',
                        created_at: new Date().toISOString()
                      })}
                      className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 px-6 rounded-2xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 flex items-center justify-center gap-3 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <Download className="w-5 h-5" />
                      Download Medical Report
                    </button>

                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}