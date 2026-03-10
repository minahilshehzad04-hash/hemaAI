import React from "react";
import { Shield, CheckCircle, Users, Heart } from "lucide-react";

export default function PatientSection({ addToRefs }: { addToRefs: (el: HTMLElement | null) => void }) {
  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div
          ref={addToRefs}
          className="text-center mb-16 transform transition-all duration-700 opacity-0 translate-y-8"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            For <span className="text-blue-600 animate-pulse">Patients</span> & Families
          </h2>
          <p className="text-xl text-gray-600">Comprehensive support throughout your cancer journey</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Shield, title: "Risk Assessment", desc: "AI-powered screening for early detection" },
            { icon: CheckCircle, title: "Second Opinion", desc: "Get verified diagnoses from specialists" },
            { icon: Users, title: "Care Team", desc: "Connect with hematologists and oncologists" },
            { icon: Heart, title: "Support Network", desc: "Join patient communities for emotional support" }
          ].map((item, index) => (
            <div
              key={index}
              ref={addToRefs}
              className="bg-white p-6 rounded-xl shadow-lg text-center transform transition-all duration-700 opacity-0 translate-y-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="group-hover:scale-110 transition-transform duration-300">
                <item.icon className="w-10 h-10 text-blue-600 mx-auto mb-3 animate-heartbeat" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
