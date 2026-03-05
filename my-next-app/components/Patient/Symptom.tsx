'use client'

import { useState, useEffect } from 'react'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Download,
  Heart,
  Info,
  Shield,
  Stethoscope,
  Thermometer,
  XCircle,
  Zap,
  Users,
  BarChart3,
  Clock,
  Sparkles,
  Calculator,
  ClipboardCheck,
  ArrowRight,
  Eye,
  Flame,
  Brain,
  AlertOctagon,
  Droplets,
  Coffee,
  CloudRain,
  Database,
  BrainCircuit,
  Cpu,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

type SymptomType = {
  [key: string]: number // 0 or 1 only
}

type RiskResult = {
  status: string
  risk_assessment: {
    risk_score: number
    risk_level: 'Low' | 'Medium' | 'High'
    symptom_count: number
    present_symptoms: string[]
  }
  model_info: {
    model_used: string
    model_type: string
    probabilities: number[]
  }
  clinical_guidance: {
    next_steps: string[]
    recommendations: string[]
    interpretation: string
  }
  symptoms_analyzed: SymptomType
  analysis_mode: string
  model_used: string
  is_demo?: boolean
  is_live?: boolean
  clinical_summary?: string
  interpretation?: string
  model_predictions?: any
  probabilities?: {
    Low: number
    Medium: number
    High: number
  }
}

type ModelStatus = {
  status: string
  models: {
    keras: { 
      loaded: boolean; 
      type: string;
      features_expected?: number;
      features_provided?: number;
    }
    image_model: { loaded: boolean; type: string }
  }
  features: number
  symptom_type: string
  symptoms?: {
    total_symptoms: number
    symptom_type: string
    feature_names: string[]
  }
}

// IMPORTANT: These must match EXACTLY with backend feature_names
const ACTUAL_SYMPTOMS = [
  'shortness_of_breath',
  'bone_pain',
  'fever',
  'family_history',
  'frequent_infections',
  'Itchy_skin_or_rash',        // Note: Capital 'I'
  'loss_of_appetite_or_nausea',
  'Persistent_weakness_and_fatigue',  // Note: Capital 'P'
  'swollen_painless_lymph',
  'significant_bruising_bleeding',
  'enlarged_liver',
  'oral_cavity',
  'vision_blurring',
  'jaundice',
  'night_sweats',
  'smokes'
]

export default function LeukemiaAssessment() {
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null)
  const [symptoms, setSymptoms] = useState<SymptomType>({})
  const [symptomsInfo, setSymptomsInfo] = useState<{ [key: string]: any }>({})
  const [result, setResult] = useState<RiskResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null)
  const [analysisTime, setAnalysisTime] = useState<number>(0)
  const [useMockData, setUseMockData] = useState(false)
  const [activeTab, setActiveTab] = useState<'symptoms' | 'results'>('symptoms')
  const [modelDetails, setModelDetails] = useState<string>('Loading...')

  const API_BASE = 'http://localhost:8000'

  useEffect(() => {
    checkModelStatus()
    loadSymptomsInfo()
  }, [])

  const checkModelStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/leukemia/model-status`)
      const data = await res.json()
      setModelStatus(data)
      console.log('Model Status:', data)
      
      // Update model details display
      if (data.models?.keras?.loaded) {
        const expected = data.models.keras.features_expected
        const provided = data.models.keras.features_provided
        setModelDetails(`Keras Neural Network (${expected} features expected, ${provided} provided)`)
      } else {
        setModelDetails('Keras model not loaded')
      }
    } catch (err) {
      console.error('Failed to check model status:', err)
      setModelDetails('Cannot connect to backend')
    }
  }

  const loadSymptomsInfo = async () => {
    try {
      const res = await fetch(`${API_BASE}/leukemia/symptoms-info`)
      const data = await res.json()
      setSymptomsInfo(data.symptoms || {})
      console.log('Symptoms Info:', data)

      // Initialize all symptoms as 0 (not present)
      const initial: SymptomType = {}
      ACTUAL_SYMPTOMS.forEach(key => {
        initial[key] = 0
      })
      setSymptoms(initial)
    } catch (err) {
      console.error('Failed to load symptoms info:', err)
      // Fallback initialization
      const initial: SymptomType = {}
      ACTUAL_SYMPTOMS.forEach(key => {
        initial[key] = 0
      })
      setSymptoms(initial)
    }
  }

  const handleSymptomToggle = (key: string) => {
    setSymptoms(prev => ({
      ...prev,
      [key]: prev[key] === 0 ? 1 : 0
    }))
  }

  const getMockResult = async (symptoms: SymptomType): Promise<RiskResult> => {
    await new Promise(resolve => setTimeout(resolve, 1500))

    const symptomCount = Object.values(symptoms).filter(v => v === 1).length
    let riskLevel: 'Low' | 'Medium' | 'High' = 'Low'
    let riskScore = 0
    
    if (symptomCount >= 10) {
      riskLevel = 'High'
      riskScore = 85
    } else if (symptomCount >= 5) {
      riskLevel = 'Medium'
      riskScore = 55
    } else {
      riskLevel = 'Low'
      riskScore = 20
    }

    return {
      status: 'success',
      risk_assessment: {
        risk_score: riskScore,
        risk_level: riskLevel,
        symptom_count: symptomCount,
        present_symptoms: Object.entries(symptoms)
          .filter(([_, v]) => v === 1)
          .map(([k]) => k.replace(/_/g, ' '))
      },
      model_info: {
        model_used: 'demo_mock',
        model_type: 'demo',
        probabilities: riskLevel === 'High' ? [0.1, 0.3, 0.6] : 
                      riskLevel === 'Medium' ? [0.2, 0.5, 0.3] : 
                      [0.7, 0.2, 0.1]
      },
      clinical_guidance: {
        next_steps: getNextSteps(riskLevel),
        recommendations: getRecommendations(riskLevel),
        interpretation: `Based on ${symptomCount} symptoms, mock analysis indicates ${riskLevel.toLowerCase()} risk.`
      },
      symptoms_analyzed: symptoms,
      analysis_mode: 'demo_mode',
      model_used: 'demo_mock',
      is_demo: true,
      is_live: false,
      probabilities: {
        Low: riskLevel === 'Low' ? 0.7 : 0.2,
        Medium: riskLevel === 'Medium' ? 0.6 : 0.3,
        High: riskLevel === 'High' ? 0.7 : 0.2
      }
    }
  }

  const getNextSteps = (riskLevel: 'Low' | 'Medium' | 'High') => {
    if (riskLevel === 'High') {
      return [
        "Immediate consultation with hematologist required",
        "Complete blood count (CBC) and peripheral blood smear",
        "Bone marrow aspiration and biopsy recommended",
        "Cytogenetic and molecular testing needed"
      ]
    } else if (riskLevel === 'Medium') {
      return [
        "Schedule appointment with primary care physician",
        "Complete basic blood work (CBC, LDH, chemistry panel)",
        "Consider referral to hematology specialist",
        "Follow up in 2-4 weeks for reassessment"
      ]
    } else {
      return [
        "Annual wellness check with primary care physician",
        "Routine blood tests during regular checkups",
        "Maintain healthy lifestyle habits",
        "Reassess if symptoms develop or change"
      ]
    }
  }

  const getRecommendations = (riskLevel: 'Low' | 'Medium' | 'High') => {
    if (riskLevel === 'High') {
      return [
        "Seek emergency medical attention within 24 hours",
        "Avoid any strenuous activities or contact sports",
        "Monitor for fever, bleeding, or breathing difficulties",
        "Complete all prescribed diagnostic tests promptly"
      ]
    } else if (riskLevel === 'Medium') {
      return [
        "Monitor symptoms daily in a health journal",
        "Maintain regular sleep schedule and nutrition",
        "Avoid unnecessary infections (wash hands, masks)",
        "Report any new or worsening symptoms immediately"
      ]
    } else {
      return [
        "Continue regular exercise and balanced diet",
        "Annual complete physical examination",
        "Stay up to date with vaccinations",
        "Report any concerning symptoms promptly"
      ]
    }
  }

  const performRealAssessment = async (symptoms: SymptomType): Promise<RiskResult> => {
    try {
      const response = await fetch(`${API_BASE}/leukemia/assess-risk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(symptoms),
        signal: AbortSignal.timeout(10000)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Server error: ${response.status} - ${errorData.detail || 'Unknown error'}`)
      }

      const result = await response.json()
      console.log('Assessment result:', result)
      return result
    } catch (error: any) {
      if (error.name === 'TimeoutError') {
        throw new Error('Server timeout - please try again')
      }
      throw error
    }
  }

  const analyzeSymptoms = async () => {
    const startTime = Date.now()
    setLoading(true)
    setError('')
    setResult(null)
    setActiveTab('results')

    try {
      // Check if user is logged in (optional)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please login to save assessment history')
        // Continue anyway, just won't save to database
      }

      let assessmentResult: RiskResult

      if (useMockData) {
        assessmentResult = await getMockResult(symptoms)
      } else {
        // Check if Keras model is loaded
        if (modelStatus && !modelStatus.models?.keras?.loaded && !useMockData) {
          throw new Error('AI model is not available. Please use demo mode or try again later.')
        }
        
        assessmentResult = await performRealAssessment(symptoms)
      }

      // Store in Supabase if user is logged in
      if (user) {
        const insertData = {
          patient_id: user.id,
          risk_score: assessmentResult.risk_assessment.risk_score,
          risk_level: assessmentResult.risk_assessment.risk_level,
          analysis_mode: assessmentResult.analysis_mode,
          model_used: assessmentResult.model_used,
          symptoms: assessmentResult.symptoms_analyzed,
          next_steps: assessmentResult.clinical_guidance.next_steps,
          recommendations: assessmentResult.clinical_guidance.recommendations,
          created_at: new Date().toISOString(),
        }

        const { error: supabaseError } = await supabase
          .from('leukemia_assessments')
          .insert([insertData])

        if (supabaseError) {
          console.error('Supabase storage error:', supabaseError)
          toast.error('Assessment completed but failed to save record')
        } else {
          toast.success('Assessment saved to your history!')
        }
      }

      setResult(assessmentResult)
      const endTime = Date.now()
      setAnalysisTime((endTime - startTime) / 1000)
      toast.success('AI analysis completed successfully!')

    } catch (err: any) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      toast.error(message)
      console.error('Assessment error:', err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    const resetSymptoms: SymptomType = {}
    ACTUAL_SYMPTOMS.forEach(key => { resetSymptoms[key] = 0 })
    setSymptoms(resetSymptoms)
    setResult(null)
    setError('')
    setAnalysisTime(0)
    setActiveTab('symptoms')
  }

  const hasSymptoms = Object.values(symptoms).some(v => v === 1)

  const formatSymptomName = (key: string) => {
    return key.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getRiskStyle = (level: 'Low' | 'Medium' | 'High') => {
    const styles = {
      Low: {
        bg: 'bg-gradient-to-br from-green-50 to-emerald-100',
        border: 'border-green-200',
        text: 'text-green-800',
        iconBg: 'bg-green-100 text-green-600',
        icon: CheckCircle,
        shadow: 'shadow-green-500/10'
      },
      Medium: {
        bg: 'bg-gradient-to-br from-yellow-50 to-amber-100',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        iconBg: 'bg-yellow-100 text-yellow-600',
        icon: AlertTriangle,
        shadow: 'shadow-yellow-500/10'
      },
      High: {
        bg: 'bg-gradient-to-br from-red-50 to-rose-100',
        border: 'border-red-200',
        text: 'text-red-800',
        iconBg: 'bg-red-100 text-red-600',
        icon: XCircle,
        shadow: 'shadow-red-500/10'
      }
    }
    return styles[level] || styles.Low
  }

  const getSymptomIcon = (key: string) => {
    const icons: { [key: string]: any } = {
      shortness_of_breath: Activity,
      bone_pain: Heart,
      fever: Thermometer,
      frequent_infections: Shield,
      Persistent_weakness_and_fatigue: Zap,
      significant_bruising_bleeding: AlertCircle,
      night_sweats: CloudRain,
      family_history: Users,
      jaundice: AlertTriangle,
      Itchy_skin_or_rash: Droplets,
      loss_of_appetite_or_nausea: Coffee,
      swollen_painless_lymph: Shield,
      enlarged_liver: AlertOctagon,
      oral_cavity: Heart,
      vision_blurring: Eye,
      smokes: Flame,
    }
    return icons[key] || AlertCircle
  }

  const getModelIcon = () => {
    if (!modelStatus) return Database
    
    if (modelStatus.models?.keras?.loaded) {
      return Brain
    } else {
      return Cpu
    }
  }

  const downloadReport = () => {
    if (!result) return

    const report = {
      'HemaAI Leukemia Risk Assessment Report': {
        'Assessment Date': new Date().toLocaleString(),
        'Patient ID': 'N/A',
        'Risk Score': `${result.risk_assessment.risk_score}%`,
        'Risk Level': result.risk_assessment.risk_level,
        'Analysis Mode': result.analysis_mode,
        'Model Used': result.model_used,
        'Clinical Summary': result.clinical_guidance.interpretation,
        'Symptoms Present': result.risk_assessment.present_symptoms,
        'Probabilities': result.model_info.probabilities,
        'Next Steps': result.clinical_guidance.next_steps,
        'Recommendations': result.clinical_guidance.recommendations,
        'Processing Time': `${analysisTime.toFixed(2)} seconds`,
        'Assessment Mode': useMockData ? 'Demo' : 'Live',
        'Generated By': 'HemaAI Symptom Assessment System',
        'Disclaimer': 'This is an AI-assisted assessment and should not replace professional medical advice.'
      }
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Leukemia_Risk_Assessment_${result.risk_assessment.risk_level}_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Assessment report downloaded successfully')
  }

  const getSymptomCount = () => {
    return Object.values(symptoms).filter(v => v === 1).length
  }

  const getModelStatusText = () => {
    if (!modelStatus) return 'Checking...'
    
    if (modelStatus.models?.keras?.loaded) {
      const expected = modelStatus.models.keras.features_expected
      const provided = modelStatus.models.keras.features_provided
      return expected === provided ? 
        '✓ Keras Model Ready' : 
        `⚠ Keras Model (${expected} features expected, ${provided} provided)`
    } else {
      return '✗ Keras Model Not Loaded'
    }
  }

  const getModelStatusColor = () => {
    if (!modelStatus) return 'text-yellow-600'
    
    if (modelStatus.models?.keras?.loaded) {
      const expected = modelStatus.models.keras.features_expected
      const provided = modelStatus.models.keras.features_provided
      return expected === provided ? 'text-green-600' : 'text-yellow-600'
    } else {
      return 'text-red-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl shadow-blue-500/5">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/25">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#1976D2]">
                  AI Symptom Risk Assessment
                </h1>
                <p className="text-gray-600 text-lg mt-1 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-red-500" />
                  Binary symptom analysis using Keras Neural Network
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/60 rounded-2xl p-4 border border-gray-100">
              {modelStatus && (
                <>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getModelStatusColor()}`}>
                      {modelStatus.models?.keras?.loaded ? '✓' : '✗'}
                    </div>
                    <div className="text-xs text-gray-500">Keras Model</div>
                  </div>
                  <div className="h-8 w-px bg-gray-200" />
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {getSymptomCount()}
                    </div>
                    <div className="text-xs text-gray-500">Symptoms</div>
                  </div>
                  <div className="h-8 w-px bg-gray-200" />
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${useMockData ? 'text-yellow-600' : 'text-green-600'}`}>
                      {useMockData ? 'Demo' : 'Live'}
                    </div>
                    <div className="text-xs text-gray-500">Mode</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Model Info Bar */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const ModelIcon = getModelIcon()
                  return (
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <ModelIcon className="w-5 h-5 text-blue-600" />
                    </div>
                  )
                })()}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {getModelStatusText()}
                  </p>
                  <p className="text-xs text-gray-600">
                    {modelStatus?.models?.keras?.loaded ? 
                      'Using Keras Neural Network for predictions' : 
                      'Please use demo mode or check backend connection'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Features</p>
                <p className="text-sm font-medium text-gray-900">
                  {modelStatus?.features || 16} binary symptoms
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mt-6">
            <button
              onClick={() => setActiveTab('symptoms')}
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'symptoms' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <ClipboardCheck className="inline-block w-4 h-4 mr-2" />
              Symptoms Selection
            </button>
            {result && (
              <button
                onClick={() => setActiveTab('results')}
                className={`px-4 py-2 font-medium text-sm ${activeTab === 'results' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <BarChart3 className="inline-block w-4 h-4 mr-2" />
                Results
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {activeTab === 'symptoms' && (
            <div className="bg-white rounded-3xl shadow-xl shadow-blue-500/5 border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <ClipboardCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Binary Symptom Selection</h2>
                    <p className="text-gray-600 text-sm">Select symptoms that are present (1 = Present, 0 = Not Present)</p>
                  </div>
                </div>
                {hasSymptoms && (
                  <button
                    onClick={resetForm}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all duration-200 border border-gray-200"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* Current Status */}
              {hasSymptoms && (
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Database className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Selected Symptoms</p>
                        <p className="text-2xl font-bold text-blue-700">{getSymptomCount()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total possible</p>
                      <p className="text-lg font-bold text-gray-900">16</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Symptoms Grid - Binary Toggle */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {ACTUAL_SYMPTOMS.map((key) => {
                  const SymptomIcon = getSymptomIcon(key)
                  const isPresent = symptoms[key] === 1
                  const symptomInfo = symptomsInfo[key]

                  return (
                    <div key={key} className={`bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 border transition-all duration-300 hover:shadow-lg ${isPresent ? 'border-green-300 bg-green-50/50' : 'border-gray-200 hover:border-blue-300'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPresent ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                            <SymptomIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">
                              {formatSymptomName(key)}
                            </h3>
                            <div className="flex items-center gap-2">
                              <p className={`text-xs font-medium ${isPresent ? 'text-green-600' : 'text-gray-500'}`}>
                                {isPresent ? 'Present' : 'Not Present'}
                              </p>
                              {isPresent && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                  +1
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setExpandedInfo(expandedInfo === key ? null : key)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Symptom Info */}
                      {expandedInfo === key && symptomInfo && (
                        <div className="mb-3 bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
                          {symptomInfo.description}
                        </div>
                      )}

                      {/* Binary Toggle Button */}
                      <button
                        onClick={() => handleSymptomToggle(key)}
                        className={`w-full py-2 px-4 rounded-xl transition-all duration-300 font-medium text-sm ${isPresent
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                          }`}
                      >
                        {isPresent ? '✓ Symptom Present' : '○ Not Present'}
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Analysis Time */}
              {analysisTime > 0 && (
                <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700">
                      Analysis completed in <span className="font-bold">{analysisTime.toFixed(2)}</span> seconds
                    </span>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mb-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-red-800 font-semibold">Assessment Error</p>
                      <p className="text-red-600 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Keras Model Warning (if feature mismatch) */}
              {modelStatus?.models?.keras?.loaded && 
               modelStatus.models.keras.features_expected !== modelStatus.models.keras.features_provided && (
                <div className="mb-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-yellow-800 font-semibold">Feature Mismatch Detected</p>
                      <p className="text-yellow-600 text-sm mt-1">
                        Keras model expects {modelStatus.models.keras.features_expected} features, 
                        but we're providing {modelStatus.models.keras.features_provided}. 
                        Using compatibility mode.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={analyzeSymptoms}
                  disabled={!hasSymptoms || loading}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-2xl hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 font-bold flex items-center justify-center gap-3 shadow-2xl shadow-red-500/25 hover:shadow-2xl transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Analyzing Symptoms...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Assess Risk with AI</span>
                    </>
                  )}
                </button>

                {/* Demo Mode Toggle */}
                <div className="flex items-center justify-between bg-gray-50/50 rounded-2xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <Calculator className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Demo Mode</p>
                      <p className="text-xs text-gray-600">Use mock data for testing</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setUseMockData(!useMockData)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useMockData ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useMockData ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>

                {/* Force demo mode if Keras not loaded */}
                {!useMockData && modelStatus && !modelStatus.models?.keras?.loaded && (
                  <div className="mt-2 text-center">
                    <p className="text-sm text-red-600">
                      Keras model not available. Please use Demo Mode.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'results' && result && (
            <div className="bg-white rounded-3xl shadow-xl shadow-blue-500/5 border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">AI Assessment Results</h2>
                    <p className="text-gray-600 text-sm">Keras Neural Network analysis</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getRiskStyle(result.risk_assessment.risk_level).iconBg} border ${getRiskStyle(result.risk_assessment.risk_level).border}`}>
                    {result.risk_assessment.risk_level} Risk
                  </span>
                  {useMockData || result.is_demo ? (
                    <span className="px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                      Demo Mode
                    </span>
                  ) : (
                    <span className="px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                      Live ML Model
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {/* Model Info */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    AI Model Analysis
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-blue-700 mb-1">Model Used</p>
                      <p className="text-sm font-medium text-blue-900">{result.model_info.model_used}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-700 mb-1">Analysis Mode</p>
                      <p className="text-sm font-medium text-blue-900">{result.analysis_mode}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-700 mb-1">Processing Time</p>
                      <p className="text-sm font-medium text-blue-900">{analysisTime.toFixed(2)}s</p>
                    </div>
                  </div>
                  <p className="text-blue-800 text-sm mt-3">{result.clinical_guidance.interpretation}</p>
                </div>

                {/* Risk Score Card */}
                <div className={`rounded-2xl p-6 border ${getRiskStyle(result.risk_assessment.risk_level).border} ${getRiskStyle(result.risk_assessment.risk_level).bg} ${getRiskStyle(result.risk_assessment.risk_level).shadow}`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Risk Level</p>
                      <div className="flex items-center justify-center gap-3">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${getRiskStyle(result.risk_assessment.risk_level).iconBg}`}>
                          {(() => {
                            const Icon = getRiskStyle(result.risk_assessment.risk_level).icon
                            return <Icon className="w-8 h-8" />
                          })()}
                        </div>
                        <p className={`text-3xl font-bold ${getRiskStyle(result.risk_assessment.risk_level).text}`}>
                          {result.risk_assessment.risk_level}
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Risk Score</p>
                      <div className="flex items-center justify-center">
                        <div className="w-24 h-24 relative">
                          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                            <circle
                              cx="50" cy="50" r="40"
                              stroke={result.risk_assessment.risk_level === 'High' ? "#ef4444" : result.risk_assessment.risk_level === 'Medium' ? "#f59e0b" : "#10b981"}
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={251.2}
                              strokeDashoffset={251.2 * (1 - result.risk_assessment.risk_score / 100)}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-900">
                            {result.risk_assessment.risk_score}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Symptoms Detected</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {result.risk_assessment.symptom_count}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">out of 16 symptoms</p>
                    </div>
                  </div>
                </div>

                {/* Probability Breakdown */}
                {result.model_info.probabilities && (
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-gray-600" />
                      AI Probability Estimates
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {result.model_info.probabilities.map((prob, index) => {
                        const levels = ['Low', 'Medium', 'High']
                        const level = levels[index] || 'Unknown'
                        return (
                          <div key={level} className={`p-4 rounded-xl border ${level === 'Low' ? 'bg-green-50 border-green-200' : level === 'Medium' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                            <p className="text-xs text-gray-600 mb-1">{level} Risk Probability</p>
                            <p className="text-2xl font-bold text-gray-900">{(prob * 100).toFixed(1)}%</p>
                            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${level === 'Low' ? 'bg-green-500' : level === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${prob * 100}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Selected Symptoms */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-gray-600" />
                    Selected Symptoms ({result.risk_assessment.symptom_count})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.risk_assessment.present_symptoms.map((symptom) => {
                      const SymptomIcon = getSymptomIcon(symptom.replace(/ /g, '_').toLowerCase())
                      return (
                        <div key={symptom} className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-full border border-green-200">
                          <SymptomIcon className="w-4 h-4" />
                          <span className="text-sm font-medium">{symptom}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Next Steps & Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 mb-4 flex items-center gap-2">
                      <ArrowRight className="w-5 h-5 text-blue-600" />
                      Immediate Next Steps
                    </h4>
                    <ul className="space-y-3">
                      {result.clinical_guidance.next_steps.map((step, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-blue-800 leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-5 border border-green-200">
                    <h4 className="text-sm font-semibold text-green-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Recommendations
                    </h4>
                    <ul className="space-y-3">
                      {result.clinical_guidance.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-green-800 leading-relaxed">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={downloadReport}
                    className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 px-6 rounded-2xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 flex items-center justify-center gap-3 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Download className="w-5 h-5" />
                    Download Assessment Report
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-3 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <ClipboardCheck className="w-5 h-5" />
                    New Assessment
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 animate-in fade-in duration-300">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">AI Analysis in Progress</h3>
              <p className="text-gray-600 text-center text-sm">
                {useMockData ? 'Running demo analysis...' : 'Keras Neural Network is analyzing your symptoms...'}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-500 animate-pulse" />
                <span className="text-xs text-blue-600">
                  {useMockData ? 'Demo Mode' : 'Processing with Keras Model'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}