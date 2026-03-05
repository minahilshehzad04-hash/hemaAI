'use client'

import {
  ArrowRight, Users, Stethoscope, Microscope, FileText, Video,
  Award, Activity, Shield, Clock, TrendingUp
} from 'lucide-react'

import { HeroSection } from '@/components/General/Shared/HeroSection'
import { FeaturesSection } from '@/components/General/Shared/FeaturesSection'
import { ProcessSection } from '@/components/General/Shared/ProcessSection'
import { CTASection } from '@/components/General/Shared/CTASection'
import { BenefitsSection } from '@/components/General/Shared/BenefitsSection'
import { InsightsSection } from '@/components/General/Shared/InsightsSection'

export default function DoctorsPage() {
  const handleLearnMore = () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })

  const features = [
    {
      icon: <Microscope className="w-8 h-8 text-blue-700" />,
      title: "AI-Powered Diagnosis",
      description: "Advanced models for accurate blood cancer detection with 95%+ accuracy."
    },
    {
      icon: <FileText className="w-8 h-8 text-blue-700" />,
      title: "Digital Patient Records",
      description: "Access secure and organized histories, results, and treatment plans."
    },
    {
      icon: <Video className="w-8 h-8 text-blue-700" />,
      title: "Telemedicine Platform",
      description: "Consult virtually with patients from anywhere, anytime."
    }
  ]

  const steps = [
    { 
      number: "01", 
      title: "Register & Verify", 
      description: "Complete your professional profile with PMDC verification" 
    },
    { 
      number: "02", 
      title: "Access AI Tools", 
      description: "Train on our AI diagnostic platform features" 
    },
    { 
      number: "03", 
      title: "Start Consulting", 
      description: "Accept patients and use AI-assisted diagnosis" 
    },
    { 
      number: "04", 
      title: "Grow Your Practice", 
      description: "Expand reach with telemedicine & referrals" 
    }
  ]

  const benefits = [
    {
      icon: <Shield className="w-8 h-8 text-blue-700" />,
      title: "Enhanced Diagnosis",
      description: "AI assistance reduces diagnostic errors by 40% and improves accuracy."
    },
    {
      icon: <Clock className="w-8 h-8 text-blue-700" />,
      title: "Time Efficiency",
      description: "Reduce paperwork by 60% and focus more on patient care."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-blue-700" />,
      title: "Practice Growth",
      description: "Access to national patient network increases your reach by 300%."
    },
    {
      icon: <Award className="w-8 h-8 text-blue-700" />,
      title: "Professional Development",
      description: "Continuous learning with latest research and case studies."
    }
  ]

  const insights = [
    {
      icon: <Activity className="w-8 h-8 text-blue-700" />,
      title: "Clinical Trends",
      description: "Get real-time insights on latest blood cancer treatment protocols and survival rates."
    },
    {
      icon: <Microscope className="w-8 h-8 text-blue-700" />,
      title: "AI Research Updates",
      description: "Stay updated with AI advancements validated by top oncology research institutes."
    },
    {
      icon: <Users className="w-8 h-8 text-blue-700" />,
      title: "Global Case Studies",
      description: "Learn from anonymized global patient data and rare case reports curated for doctors."
    },
    {
      icon: <Award className="w-8 h-8 text-blue-700" />,
      title: "Best Practice Guidelines",
      description: "Access evidence-based guidelines to improve patient outcomes and reduce errors."
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <HeroSection
        title={<>Empowering <span className="text-yellow-300">Doctors</span> with AI-Powered Healthcare</>}
        subtitle="Use AI to enhance diagnosis, streamline patient management, and deliver care beyond boundaries."
        backgroundImage="/images/doctor-hero.jpg"
        decorationIcon={<Stethoscope className="w-16 h-16 text-yellow-300 mx-auto" />}
        primaryButton={{
          text: "Join as Doctor",
          href: "/login",
          variant: "white",
          icon: <ArrowRight className="w-5 h-5" />
        }}
        secondaryButton={{
          text: "Learn More",
          onClick: handleLearnMore
        }}
      />

      <FeaturesSection
        id="features"
        title="Why Doctors Choose HemaAI"
        subtitle="A single platform to boost diagnostic accuracy, streamline workflows, and enhance patient trust."
        features={features}
        bgColor="bg-gradient-to-b from-white to-blue-50"
      />

      <ProcessSection
        title="Your Journey with HemaAI"
        subtitle="Just four simple steps to transform your practice"
        steps={steps}
        bgColor="bg-white"
        showConnectors={true}
      />

      <BenefitsSection
        title="Benefits for Medical Professionals"
        benefits={benefits}
        gradient="bg-gradient-to-b from-white to-blue-50"
        bgColor="text-gray-900"
      />

      <InsightsSection
        title="Research & AI Insights for Doctors"
        subtitle="HemaAI not only assists in diagnosis but also empowers doctors with continuous medical research, case insights, and AI-driven recommendations."
        insights={insights}
        gradient="bg-gradient-to-b from-white to-blue-50"
      />

      <CTASection
        title="Ready to Transform Your Practice with AI?"
        description="Join hundreds of doctors already using HemaAI to enhance diagnosis and improve patient outcomes."
        buttonText="Join as Doctor"
        buttonHref="/login"
        buttonIcon={Users}
        gradient="animate-blueShift"
      />
    </div>
  )
}