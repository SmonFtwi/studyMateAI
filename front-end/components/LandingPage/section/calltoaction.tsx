'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CallToActionSection() {
  return (
    <section className=" py-10">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Ready to learn smarter?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Join thousands of students using StudyMate to turn study material into interactive, AI-enhanced learning tools.
        </p>
        <div className="flex justify-center">
          <Link href="/register">
            <Button className="group px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition">
              Get Started Now <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
} 
