'use client'

import { Upload, Brain,  MessageSquareText, StickyNote } from 'lucide-react'

export default function HowItWorksSection() {
  return (
    <section className=" py-24 px-6 ">
      <div className="max-w-5xl mx-auto text-center space-y-16">
        <div className="space-y-4">
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            How It Works
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            From upload to understanding — here's how StudyMate supports your study process step-by-step.
          </p>
        </div>

        <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 text-left">
          <li className="flex flex-col items-center text-center space-y-4">
            <div className="bg-blue-100 dark:bg-blue-800/30 p-4 rounded-full">
              <Upload className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">1. Upload Files</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add your notes, textbooks, or slides in PDF or DOC format.
            </p>
          </li>

          <li className="flex flex-col items-center text-center space-y-4">
            <div className="bg-indigo-100 dark:bg-indigo-800/30 p-4 rounded-full">
              <Brain className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">2. AI Processing</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              StudyMate analyzes the content to extract structure, concepts, and meaning.
            </p>
          </li>

          <li className="flex flex-col items-center text-center space-y-4">
            <div className="bg-purple-100 dark:bg-purple-800/30 p-4 rounded-full">
            <StickyNote className="w-6 h-6 text-purple-600 dark:text-purple-300" />

            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">3. Get Results</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Receive summaries, flashcards, and cheatsheets tailored to your input.
            </p>
          </li>

          <li className="flex flex-col items-center text-center space-y-4">
            <div className="bg-yellow-100 dark:bg-yellow-800/30 p-4 rounded-full">
              <MessageSquareText className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">4. Chat & Study</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ask questions and review your material interactively anytime.
            </p>
          </li>
        </ol>
      </div>
    </section>
  )
} 
