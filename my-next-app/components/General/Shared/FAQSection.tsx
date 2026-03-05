'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { ReactNode } from 'react'

interface FAQItem {
  question: string
  answer: string | ReactNode
}

interface FAQSectionProps {
  title: string
  subtitle?: string
  faqs: FAQItem[]
  bgColor?: string
}

export const FAQSection = ({
  title,
  subtitle,
  faqs,
  bgColor = 'bg-gray-50'
}: FAQSectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className={`py-20 ${bgColor}`}>
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-gray-600">
              {subtitle}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <motion.div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                layout
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex justify-between items-center w-full p-6 text-left hover:bg-gray-50 rounded-xl"
                >
                  <span className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0 text-blue-600"
                  >
                    <Plus className="w-5 h-5" />
                  </motion.span>
                </button>

                <motion.div
                  animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden px-6 border-t border-gray-200"
                >
                  <div className="text-gray-600 leading-relaxed py-4">
                    {typeof faq.answer === 'string' ? <p>{faq.answer}</p> : faq.answer}
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}