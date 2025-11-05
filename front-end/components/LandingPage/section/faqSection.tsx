'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'What file types can I upload?',
    answer: 'You can upload PDF, Word (DOC/DOCX), or plain text files. We’ll parse and analyze them automatically.'
  },
  {
    question: 'Can I edit the generated content?',
    answer: 'Yes, you can manually adjust summaries, flashcards, and cheat sheets within each project.'
  },
  {
    question: 'Is my data private?',
    answer: 'Absolutely. Your uploaded content is only accessible to you. Nothing is used or shared without your consent.'
  },
  {
    question: 'How much does it cost?',
    answer: 'StudyMate has a free tier with core features. Premium features will be available in upcoming versions.'
  },
  {
    question: 'Can I use StudyMate offline?',
    answer: 'Currently, an internet connection is required. Offline support is planned for future updates.'
  },
  {
    question: 'What languages are supported?',
    answer: 'Currently, StudyMate works best with English content. Multilingual support is under development.'
  },
  {
    question: 'Can I organize multiple subjects or courses?',
    answer: 'Yes, you can create separate projects for each course, subject, or topic.'
  },
  {
    question: 'How accurate are the AI summaries?',
    answer: 'Summaries are designed for clarity and coverage. You can always refine them manually if needed.'
  }
]

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i)
  }

  return (
    <section className=" py-24 px-6 ">
      <div className=" mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Answers to some common questions about StudyMate’s features, usage, and privacy.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left text-gray-900 dark:text-white font-medium focus:outline-none"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 transform transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}
                />
              </button>
              {openIndex === i && (
                <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
