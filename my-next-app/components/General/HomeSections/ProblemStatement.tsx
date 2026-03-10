import React from "react";
import { Clock, Users, BarChart3 } from "lucide-react";

export default function ProblemStatement({ addToRefs }: { addToRefs: (el: HTMLElement | null) => void }) {
  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div
          ref={addToRefs}
          className="text-center mb-16 transform transition-all duration-700 opacity-0 translate-y-8"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            The <span className="text-red-600 animate-pulse">Blood Cancer</span> Challenge in Pakistan
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Every year, thousands of Pakistanis face delayed diagnosis and limited access to specialized care for blood cancers.
            HemaAI bridges this critical gap with intelligent solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Clock,
              bgColor: "bg-red-100",
              iconColor: "text-red-600",
              title: "Late Diagnosis",
              description: "60% of blood cancer cases are diagnosed at advanced stages due to limited screening facilities."
            },
            {
              icon: Users,
              bgColor: "bg-blue-100",
              iconColor: "text-blue-600",
              title: "Specialist Shortage",
              description: "Limited hematologists and oncologists in rural areas lead to treatment delays."
            },
            {
              icon: BarChart3,
              bgColor: "bg-green-100",
              iconColor: "text-green-600",
              title: "Data Gap",
              description: "Lack of centralized data makes personalized treatment planning challenging."
            }
          ].map((item, index) => (
            <div
              key={index}
              ref={addToRefs}
              className="bg-white p-8 rounded-xl shadow-lg text-center transform transition-all duration-700 opacity-0 translate-y-8 hover:shadow-2xl hover:-translate-y-2 hover:transition-all hover:duration-300"
            >
              <div className={`w-16 h-16 ${item.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce`}>
                <item.icon className={`w-8 h-8 ${item.iconColor}`} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
