import React from "react";
import Link from "next/link";
import { Calendar, ArrowRight, ShieldCheck, Award, Users } from "lucide-react";

export default function CtaSection({ addToRefs }: { addToRefs: (el: HTMLElement | null) => void }) {
  return (
    <section className="py-20 animate-blueShift overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div
          ref={addToRefs}
          className="text-center text-white transform transition-all duration-700 opacity-0 translate-y-8"
        >
          <h2 className="text-4xl font-bold mb-6">
            Start Your Journey to Better Health Today
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of patients and healthcare professionals using HemaAI to combat blood cancer
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {/* Book Consultation Button */}
            <Link href="/login" passHref>
              <button
                className="bg-white text-[#1976D2] px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
              >
                <Calendar className="w-5 h-5" />
                Book Free Consultation
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: ShieldCheck, text: "Medical Certified" },
              { icon: Award, text: "Award Winning Technology" },
              { icon: Users, text: "Trusted by Hospitals" }
            ].map((feature, index) => (
              <div key={index} className="flex items-center justify-center gap-3 text-white opacity-90">
                <feature.icon className="w-5 h-5" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
