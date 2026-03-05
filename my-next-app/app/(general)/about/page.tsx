"use client"

import { 
  Heart, Users, Shield, Zap, 
  Microscope, Stethoscope, Droplets, Cpu,
  Clock
} from 'lucide-react'

export default function AboutPage() {

  const features = [
    {
      icon: <Microscope className="w-6 h-6" />,
      title: 'AI-Powered Diagnosis',
      description: 'Advanced machine learning models analyze blood smear images with 95%+ accuracy for early cancer detection'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Three User Platforms',
      description: 'Separate interfaces for Patients, Doctors, and Blood Donors with tailored functionalities'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Real-time Analysis',
      description: 'Instant blood test results and risk assessments within minutes'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure & Private',
      description: 'HIPAA compliant data protection ensuring complete patient privacy and security'
    }
  ]

  const appStats = [
    { icon: <Heart className="w-8 h-8" />, value: '50,000+', label: 'Lives Impacted' },
    { icon: <Stethoscope className="w-8 h-8" />, value: '1,000+', label: 'Doctors Registered' },
    { icon: <Droplets className="w-8 h-8" />, value: '5,000+', label: 'Blood Donors' },
    { icon: <Clock className="w-8 h-8" />, value: '24/7', label: 'Availability' }
  ]

  const howItWorks = [
    { step: 1, title: 'Upload or Sync Data', description: 'Patients can upload blood reports or sync health data from devices' },
    { step: 2, title: 'AI Analysis', description: 'Our algorithms analyze the data for potential blood cancer markers' },
    { step: 3, title: 'Get Results', description: 'Receive detailed reports with risk assessment and recommendations' },
    { step: 4, title: 'Connect with Experts', description: 'Seamlessly connect with hematologists for consultation' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">

      {/* HERO SECTION */}
      <section className="relative text-white py-24 animate-fadeUp animate-blueShift">
        <div className="max-w-7xl mx-auto px-6 text-center">

          <div className="flex items-center justify-center gap-3 mb-5 animate-fadeUp">
            <Heart className="w-10 h-10 text-red-300 animate-fadeUp" />
            <span className="text-3xl font-bold tracking-wide">HemaAI</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 drop-shadow-lg animate-fadeUp delay-150">
            About HemaAI
          </h1>

          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed animate-fadeUp delay-300">
            Revolutionizing blood cancer detection through AI.  
            Making early diagnosis accessible to everyone, everywhere.
          </p>
        </div>
      </section>

      {/* WHAT IS HEMAAI */}
      <section className="py-20 bg-white animate-fadeUp delay-150">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">

          {/* TEXT SIDE */}
          <div className="animate-fadeUp">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              What is HemaAI?
            </h2>

            <div className="space-y-5 text-gray-700 leading-relaxed">
              <p>
                <strong className="text-blue-600">HemaAI</strong> is an intelligent healthcare platform that uses 
                advanced artificial intelligence to detect blood cancers at their earliest stages.
              </p>
              <p>
                The system analyzes blood smear images and health data to identify potential
                risks of leukemia, lymphoma, and myeloma.
              </p>
              <p>
                Designed as a comprehensive ecosystem, it connects patients with doctors
                and blood donors — building a strong medical support network.
              </p>
            </div>
          </div>

          {/* IMAGE WITH BADGE */}
          <div className="relative animate-fadeUp delay-200">
            <img 
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80"
              className="rounded-2xl shadow-xl w-full hover:scale-105 transition-transform duration-500"
            />

            <div className="absolute -bottom-6 -left-6 bg-blue-700 text-white p-6 rounded-2xl shadow-xl animate-fadeUp delay-300">
              <Zap className="w-8 h-8 mb-2" />
              <p className="font-semibold">AI-Powered Healthcare</p>
              <p className="text-sm">Accessible to Everyone</p>
            </div>
          </div>

        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 bg-white animate-fadeUp delay-300">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900">Why Choose HemaAI?</h2>
            <p className="text-gray-600 text-lg mt-2">Features designed for modern AI healthcare</p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 stagger">
            {features.map((item, i) => (
              <div 
                key={i} 
                className="bg-gray-50 p-8 rounded-2xl hover:shadow-xl hover:scale-[1.02] transition-all border"
              >
                <div className="text-blue-600 mb-3">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50 animate-fadeUp delay-400">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900">How HemaAI Works</h2>
            <p className="text-lg text-gray-600 mt-2">Simple steps to smarter health</p>
          </div>

          <div className="grid md:grid-cols-4 gap-10 stagger">
            {howItWorks.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-blue-700 text-white rounded-full mx-auto flex items-center justify-center text-2xl font-bold mb-4 shadow-md">
                  {step.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* TECHNOLOGY */}
      <section className="py-20 bg-white animate-fadeUp delay-500">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900">Advanced Technology</h2>
            <p className="text-gray-600 text-lg">Powered by cutting-edge AI research</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 stagger">
            {[
              { title: 'Machine Learning', desc: 'Deep learning models trained on thousands of blood samples' },
              { title: 'Computer Vision', desc: 'Advanced image analysis for blood cell classification' },
              { title: 'Real-time Processing', desc: 'Instant analysis and results delivery' },
              { title: 'Secure Cloud', desc: 'Enterprise-grade security and data protection' },
              { title: 'Mobile First', desc: 'Works smoothly on all devices' },
              { title: 'API Integration', desc: 'Connects seamlessly with medical devices' }
            ].map((item, i) => (
              <div 
                key={i} 
                className="bg-gray-50 p-8 rounded-xl text-center shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all"
              >
                <Cpu className="w-10 h-10 text-blue-700 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  )
}
