'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CallToActionSection() {
  return (
    <section className="py-14">
      <div className="max-w-3xl mx-auto text-center space-y-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/70 p-8 shadow-[0_22px_70px_-55px_rgba(0,0,0,0.5)]">
        <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
          Join the workspace
        </p>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">
          Ready for a quieter study flow?
        </h2>
        <p className="text-neutral-600 dark:text-neutral-300 text-lg">
          Turn your sources into a clean, searchable library. No neon gradients
          or clutter—just the tools to keep you moving.
        </p>
        <div className="flex justify-center">
          <Link href="/register">
            <Button className="group px-7 py-3 text-base font-semibold bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition">
              Get started
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
} 
