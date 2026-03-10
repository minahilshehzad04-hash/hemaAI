import React from "react";
import { Brain, Target, Zap } from "lucide-react";

export default function SolutionSection({ addToRefs }: { addToRefs: (el: HTMLElement | null) => void }) {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2
              ref={addToRefs}
              className="text-4xl font-bold text-gray-900 mb-6 transform transition-all duration-700 opacity-0 translate-y-8"
            >
              How <span className="text-blue-600 animate-pulse">HemaAI</span> Transforms Blood Cancer Care
            </h2>

            <div className="space-y-6 mt-15">
              {[
                {
                  icon: Brain,
                  bgColor: "bg-blue-100",
                  iconColor: "text-blue-600",
                  title: "AI-Powered Early Detection",
                  description: "Advanced algorithms analyze blood test patterns to identify cancer markers months before traditional methods."
                },
                {
                  icon: Target,
                  bgColor: "bg-green-100",
                  iconColor: "text-green-600",
                  title: "Precision Diagnosis",
                  description: "Machine learning models classify blood cancer subtypes with 95%+ accuracy for targeted treatment."
                },
                {
                  icon: Zap,
                  bgColor: "bg-purple-100",
                  iconColor: "text-purple-600",
                  title: "Smart Patient Matching",
                  description: "Connect patients with specialized doctors and blood donors based on real-time needs and compatibility."
                }
              ].map((item, index) => (
                <div
                  key={index}
                  ref={addToRefs}
                  className="flex items-start gap-4 transform transition-all duration-700 opacity-0 translate-x-8 hover:scale-105 transition-transform duration-300"
                >
                  <div className={`w-12 h-12 ${item.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 animate-pulse`}>
                    <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            ref={addToRefs}
            className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 transform transition-all duration-700 opacity-0 scale-95 hover:scale-100 transition-transform duration-500"
          >
            <img
              src="https://www.fmiblog.com/wp-content/uploads/2024/06/Blood-Cancer-Treatment-Market-1-1024x576.jpg"
              alt="HemaAI Blood Cancer Analysis"
              className="rounded-lg w-full h-auto shadow-2xl animate-float"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
