import React from "react";
import { CheckCircle } from "lucide-react";

export default function DoctorSection({ addToRefs }: { addToRefs: (el: HTMLElement | null) => void }) {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div
          ref={addToRefs}
          className="text-center mb-16 transform transition-all duration-700 opacity-0 translate-y-8"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            For <span className="text-blue-600 animate-pulse">Healthcare Professionals</span>
          </h2>
          <p className="text-xl text-gray-600">Advanced tools for better patient outcomes</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h3
              ref={addToRefs}
              className="text-2xl font-bold text-gray-900 mb-6 transform transition-all duration-700 opacity-0 translate-x-8"
            >
              Diagnostic Support
            </h3>
            <ul className="space-y-4">
              {[
                "AI-assisted blood smear analysis",
                "Predictive analytics for treatment response",
                "Real-time collaboration with specialists"
              ].map((item, index) => (
                <li
                  key={index}
                  ref={addToRefs}
                  className="flex items-center gap-3 transform transition-all duration-700 opacity-0 translate-x-8 hover:translate-x-2 transition-transform duration-300"
                >
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3
              ref={addToRefs}
              className="text-2xl font-bold text-gray-900 mb-6 transform transition-all duration-700 opacity-0 translate-x-8"
            >
              Patient Management
            </h3>
            <ul className="space-y-4">
              {[
                "Digital health records integration",
                "Automated follow-up and monitoring",
                "Clinical decision support system"
              ].map((item, index) => (
                <li
                  key={index}
                  ref={addToRefs}
                  className="flex items-center gap-3 transform transition-all duration-700 opacity-0 translate-x-8 hover:translate-x-2 transition-transform duration-300"
                >
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
