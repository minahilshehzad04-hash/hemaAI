'use client'

import {
  HeartPulse, Activity, Users, HandHeart,
  Droplet, Zap, MapPin, Shield, Bell
} from 'lucide-react'

// Import each component explicitly
import { HeroSection } from '@/components/General/Shared/HeroSection'
import { FeaturesSection } from '@/components/General/Shared/FeaturesSection'
import { ProcessSection } from '@/components/General/Shared/ProcessSection'
import { FAQSection } from '@/components/General/Shared/FAQSection'
import { CTASection } from '@/components/General/Shared/CTASection'
import { StatsSection } from '@/components/General/Shared/StatsSection'
import { BenefitsSection } from '@/components/General/Shared/BenefitsSection'

export default function DonorsPage() {
  const stats = [
    { 
      icon: <HeartPulse className="w-12 h-12 text-red-500" />, 
      label: "Lives Saved", 
      value: "12,430+", 
      description: "Through generous donations" 
    },
    { 
      icon: <Activity className="w-12 h-12 text-blue-500" />, 
      label: "Active Donors", 
      value: "8,210+", 
      description: "Registered heroes" 
    },
    { 
      icon: <Users className="w-12 h-12 text-green-500" />, 
      label: "Community Members", 
      value: "25,000+", 
      description: "Strong network" 
    },
    { 
      icon: <HandHeart className="w-12 h-12 text-pink-500" />, 
      label: "Successful Donations", 
      value: "15,300+", 
      description: "And counting" 
    },
  ]

  const features = [
    { 
      icon: <Zap className="w-8 h-8 text-blue-600" />, 
      title: "Instant Matching", 
      description: "AI-powered real-time matching with patients in need" 
    },
    { 
      icon: <MapPin className="w-8 h-8 text-blue-600" />, 
      title: "Location Based", 
      description: "Connect with recipients in your area" 
    },
    { 
      icon: <Shield className="w-8 h-8 text-blue-600" />, 
      title: "Verified System", 
      description: "Safe and secure donation process" 
    },
    { 
      icon: <Bell className="w-8 h-8 text-blue-600" />, 
      title: "Smart Alerts", 
      description: "Get notified when your blood type is needed" 
    },
  ]

  const processSteps = [
    { 
      number: "01", 
      title: "Register", 
      description: "Create your donor profile in 2 minutes" 
    },
    { 
      number: "02", 
      title: "Get Verified", 
      description: "Quick safety verification process" 
    },
    { 
      number: "03", 
      title: "Receive Alerts", 
      description: "Smart notifications for matching needs" 
    },
    { 
      number: "04", 
      title: "Save Lives", 
      description: "Donate and track your impact" 
    },
  ]

  const benefits = [
    { emoji: "🏆", title: "Recognition", description: "Digital certificates and community recognition" },
    { emoji: "⭐", title: "Health Benefits", description: "Free health checkups with every donation" },
    { emoji: "🛡️", title: "Priority Access", description: "Get blood when you need it" },
    { emoji: "📅", title: "Flexible Scheduling", description: "Donate at your convenience" },
    { emoji: "💬", title: "24/7 Support", description: "Always available to help" },
    { emoji: "👥", title: "Community", description: "Join a network of life-savers" },
  ]

  const faqs = [
    { 
      question: "Who can donate blood?", 
      answer: "Generally, healthy individuals aged 18-65, weighing at least 50kg, can donate blood. You should be in good health and meet basic eligibility criteria." 
    },
    { 
      question: "How often can I donate blood?", 
      answer: "You can donate whole blood every 12 weeks, platelets every 2 weeks, and plasma more frequently. Our system will track and notify you when you're eligible again." 
    },
    { 
      question: "Is blood donation safe?", 
      answer: "Absolutely! We use sterile, single-use equipment for each donor. All procedures are supervised by medical professionals in certified facilities." 
    },
    { 
      question: "How does HemaAI match donors with patients?", 
      answer: "Our AI analyzes blood type compatibility, location proximity, urgency level, and donor availability to create optimal life-saving matches in real-time." 
    },
    { 
      question: "What are the benefits of donating through HemaAI?", 
      answer: "You get real-time impact tracking, community recognition, health benefits, priority access when needed, and the satisfaction of saving lives efficiently." 
    },
  ]

  return (
    <div className="min-h-screen animate-blueShift">
      <HeroSection
        title={<>Become a Life Saver with <span className="text-yellow-300">HemaAI</span></>}
        subtitle="Join Pakistan's smartest blood donor network. Your single donation can save up to 3 lives through our AI-powered matching system."
        gradient="animate-blueShift"
        decorationIcon={<Droplet className="w-16 h-16 text-red-300 mx-auto animate-pulse" />}
        primaryButton={{
          text: "Register as Donor",
          href: "/login",
          variant: "outline",
          icon: <Users className="w-5 h-5" />
        }}
        center
      />

      <StatsSection stats={stats} />

      <FeaturesSection
        title="Why Choose HemaAI Donor Network?"
        subtitle="We've revolutionized blood donation with cutting-edge technology and community-driven approach"
        features={features}
        columns={4}
        bgColor="bg-gray-50"
      />

      <ProcessSection
        title="How It Works in 4 Simple Steps"
        subtitle="Start saving lives today"
        steps={processSteps}
      />

      <BenefitsSection
        title="Donor Benefits & Rewards"
        benefits={benefits}
      />

      <FAQSection
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about becoming a HemaAI donor"
        faqs={faqs}
      />

      <CTASection
        title="Ready to Make a Difference?"
        description="Join 8,210+ heroes who are saving lives every day. Your donation matters."
        buttonText="Start Saving Lives Today"
        buttonHref="/login"
        buttonIcon={HandHeart}
      />
    </div>
  )
}