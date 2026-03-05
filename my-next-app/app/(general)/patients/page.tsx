'use client'

import {
  Calendar, Clock, Shield, Users,
  Activity, TrendingUp, Plus
} from 'lucide-react'

import { HeroSection } from '@/components/General/Shared/HeroSection'
import { FeaturesSection } from '@/components/General/Shared/FeaturesSection'
import { ProcessSection } from '@/components/General/Shared/ProcessSection'
import { FAQSection } from '@/components/General/Shared/FAQSection'
import { CTASection } from '@/components/General/Shared/CTASection'
import { BenefitsSection } from '@/components/General/Shared/BenefitsSection'

export default function PatientsPage() {
  const handleLearnMore = () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })

  const features = [
    { 
      icon: <Shield className="w-8 h-8 text-blue-600" />, 
      title: "Secure Data", 
      description: "HIPAA compliant, encrypted data storage." 
    },
    { 
      icon: <Activity className="w-8 h-8 text-blue-600" />, 
      title: "AI Blood Analysis", 
      description: "Smart analysis of complete blood count (CBC) reports for early cancer signs." 
    },
    { 
      icon: <Users className="w-8 h-8 text-blue-600" />, 
      title: "Hematologist Connect", 
      description: "Instant consultation with blood cancer specialists and oncologists." 
    },
  ]

const processSteps = [
  { 
    number: "1", 
    title: "Upload Blood Reports", 
    description: "Upload your CBC, blood smear, or bone marrow reports for analysis." 
  },
  { 
    number: "2", 
    title: "AI Cancer Detection", 
    description: "Our AI detects early warning signs of leukemia, lymphoma, and myeloma." 
  },
  { 
    number: "3", 
    title: "Get Personalized Report", 
    description: "Receive detailed analysis and risk assessment from our AI system." 
  },
  { 
    number: "4", 
    title: "Expert Consultation", 
    description: "Connect with hematologists for personalized treatment plans." 
  },
]

  const benefits = [
    { 
      icon: <Clock className="w-8 h-8 text-indigo-600" />, 
      title: "Early Detection", 
      description: "Catch blood cancer at the earliest stage with 95% accuracy." 
    },
    { 
      icon: <Calendar className="w-8 h-8 text-indigo-600" />, 
      title: "Treatment Tracking", 
      description: "Monitor chemotherapy progress and medication schedules." 
    },
    { 
      icon: <Shield className="w-8 h-8 text-indigo-600" />, 
      title: "Privacy First", 
      description: "Bank-level encryption and HIPAA compliance for your data." 
    },
    { 
      icon: <TrendingUp className="w-8 h-8 text-indigo-600" />, 
      title: "Predictive Analytics", 
      description: "AI predicts disease progression and treatment outcomes." 
    },
  ]

  const faqs = [
    { 
      question: "How accurate is HemaAI's blood cancer detection?", 
      answer: "Our AI models achieve over 95% accuracy in detecting early signs of blood cancers like leukemia, lymphoma, and myeloma from blood reports." 
    },
    { 
      question: "What blood tests does HemaAI analyze?", 
      answer: "We analyze CBC (Complete Blood Count), blood smear reports, bone marrow biopsies, and other hematological tests to provide comprehensive insights." 
    },
    { 
      question: "Is my medical data secure with HemaAI?", 
      answer: "Yes, we use bank-level 256-bit encryption, HIPAA compliance protocols, and secure cloud storage to protect all your medical data." 
    },
    { 
      question: "Can HemaAI help during chemotherapy treatment?", 
      answer: "Absolutely. We monitor blood parameters, track side effects, and help manage your chemotherapy schedule for optimal treatment outcomes." 
    },
    { 
      question: "How often should I upload my blood reports?", 
      answer: "We recommend uploading new blood reports every 2-4 weeks for ongoing monitoring, or as advised by your hematologist." 
    },
    { 
      question: "Do I need a doctor's prescription to use HemaAI?", 
      answer: "No prescription needed. HemaAI is available for proactive monitoring and early detection for everyone concerned about blood cancer risks." 
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <HeroSection
        title={<>Smarter Healthcare with <span className="text-yellow-300">HemaAI</span></>}
        subtitle="Early blood cancer detection, real-time health tracking, and AI-powered insights – all in one secure platform."
        backgroundImage="/images/patient.png"
        primaryButton={{
          text: "Get Started",
          href: "/login"
        }}
        secondaryButton={{
          text: "Learn More",
          onClick: handleLearnMore
        }}
      />

      <FeaturesSection
        id="features"
        title="Powerful Features"
        features={features}
      />

      <ProcessSection
        title="How It Works"
        steps={processSteps}
        bgColor="bg-gray-50"
      />

      <BenefitsSection
        title="Why Choose HemaAI?"
        benefits={benefits}
        gradient="bg-white"
        bgColor="text-gray-900"
      />

      <FAQSection
        title="Frequently Asked Questions"
        subtitle="Get answers to common questions about HemaAI blood cancer detection."
        faqs={faqs}
        bgColor="bg-gray-50"
      />

      <CTASection
        title="Take Charge of Your Health Today"
        description="Join thousands of patients using HemaAI for early blood cancer detection and personalized care."
        buttonText="Get Started Now"
        buttonHref="/login"
        gradient="bg-gradient-to-r from-blue-600 to-indigo-600"
      />
    </div>
  )
}