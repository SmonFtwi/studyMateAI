"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Zap, ListChecks } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 shadow-[0_30px_90px_-50px_rgba(0,0,0,0.55)]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:34px_34px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-transparent to-transparent dark:from-neutral-900/60" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 sm:px-10 lg:px-14 py-14 lg:py-18">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Left rail */}
          <div className="flex-1 space-y-8">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-neutral-600 dark:text-neutral-300">
              <div className="h-px w-10 bg-neutral-700 dark:bg-neutral-200" />
              StudyMate / vector-first study desk
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-semibold tracking-tight text-neutral-900 dark:text-white leading-[1.05]">
                A quieter workspace for learning. Upload, embed, and ask—without
                the noise.
              </h1>
              <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl leading-relaxed">
                StudyMate keeps your sources structured, vectorized with Gemini
                embeddings, and ready for flashcards, summaries, and precise
                answers. Clean lines, minimal chrome, real focus.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link href="/register" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto px-7 py-3 text-base font-semibold bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition">
                  Get started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link
                href="/about"
                className="w-full sm:w-auto text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white underline underline-offset-4"
              >
                See how it works
              </Link>
            </div>

            <div className="grid grid-cols-3 max-w-lg gap-5 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              {[
                { label: "Projects shipped", value: "12.4K" },
                { label: "Recall uplift", value: "2.4x" },
                { label: "Setup time", value: "< 3 min" },
              ].map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <p className="text-[0.7rem] uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                    {stat.label}
                  </p>
                  <p className="text-xl font-semibold text-neutral-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right rail */}
          <div className="flex-1">
            <div className="rounded-2xl bg-white/90 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-700 shadow-[0_25px_80px_-50px_rgba(0,0,0,0.5)] p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400">
                    Study blueprint
                  </p>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Source to vector in 3 moves
                  </h3>
                </div>
                <ListChecks className="h-5 w-5 text-emerald-600" />
              </div>

              <div className="grid gap-3">
                {[
                  "Drop PDFs, slides, or sheets.",
                  "Gemini embeds + Pinecone stores.",
                  "Flashcards, summaries, and answers stay in sync.",
                ].map((step, idx) => (
                  <div
                    key={step}
                    className="flex items-start gap-3 rounded-xl border border-neutral-200 dark:border-neutral-700/70 bg-neutral-50 dark:bg-neutral-900/50 p-3"
                  >
                    <div className="h-7 w-7 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center text-xs font-semibold">
                      {idx + 1}
                    </div>
                    <p className="text-sm text-neutral-800 dark:text-neutral-100">
                      {step}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-900/60 p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center font-semibold">
                  AI
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    Vector-ready by default
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    Pinecone storage powered by Gemini embeddings keeps every
                    paragraph searchable.
                  </p>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
                <Image
                  src="/studyMate2.png"
                  alt="StudyMate preview"
                  width={760}
                  height={520}
                  className="w-full h-auto object-cover"
                  priority
                />
                <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1 rounded-full bg-white/85 dark:bg-neutral-900/85 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-700 dark:text-neutral-200 shadow-sm">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  Embedding live
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
