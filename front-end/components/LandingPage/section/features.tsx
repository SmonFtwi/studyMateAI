'use client'

import { Upload, ListOrdered, StickyNote, BookOpen, MessageSquare, History } from 'lucide-react'

const features = [
  {
    icon: <Upload className="w-6 h-6 text-blue-500" />,
    title: 'Upload & Analyze',
    description: 'Upload PDFs, Word docs, or notes. Content is extracted and processed automatically.'
  },
  {
    icon: <ListOrdered className="w-6 h-6 text-indigo-500" />,
    title: 'Smart Summarization',
    description: 'Generate concise summaries of complex material, organized for clarity and retention.'
  },
  {
    icon: <StickyNote className="w-6 h-6 text-purple-500" />,
    title: 'Instant Flashcards',
    description: 'Automatically turn your notes into Q&A flashcards for active recall and memorization.'
  },
  {
    icon: <BookOpen className="w-6 h-6 text-green-500" />,
    title: 'Cheatsheet Builder',
    description: 'Create printable cheatsheets focused on key topics, formulas, and facts.'
  },
  {
    icon: <MessageSquare className="w-6 h-6 text-yellow-500" />,
    title: 'Chat With Content',
    description: 'Ask questions and get contextual answers from your uploaded study material.'
  },
  {
    icon: <History className="w-6 h-6 text-pink-500" />,
    title: 'Track & Revisit',
    description: 'Maintain versioned study sessions and return to key content at any time.'
  }
]

export default function FeatureGridSection() {
  return (
    <section className="w-full px-6 md:px-12 py-20 ">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
          Key Features
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
          Powerful tools designed to enhance how you study, organize content, and interact with your materials.
        </p>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 text-left">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-xl border border-gray-200 dark:border-gray-900 p-6 hover:shadow-md transition"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 
