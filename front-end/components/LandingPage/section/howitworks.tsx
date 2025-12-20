'use client';

import { Upload, Brain, MessageSquareText, StickyNote } from "lucide-react";

const steps = [
  {
    title: "Upload",
    icon: Upload,
    detail: "Drop your PDFs, docs, or sheets. We handle parsing + OCR.",
  },
  {
    title: "Embed",
    icon: Brain,
    detail: "Gemini embeddings land in Pinecone under your project namespace.",
  },
  {
    title: "Generate",
    icon: StickyNote,
    detail: "Summaries, flashcards, and notes stay tied to the source chunks.",
  },
  {
    title: "Ask",
    icon: MessageSquareText,
    detail: "Chat with context; pull answers with citations at any time.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
            Workflow
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white mt-2">
            From source to answers
          </h2>
          <p className="text-neutral-600 dark:text-neutral-300 max-w-3xl mt-3">
            A straight line from upload to insight, without the carnival colors:
            keep your focus on the material.
          </p>
        </div>

        <div className="relative border-l border-neutral-200 dark:border-neutral-800 pl-6 space-y-8">
          <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-neutral-300 dark:via-neutral-700 to-transparent" />
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="relative flex items-start gap-4"
              >
                <div className="absolute -left-[34px] mt-1 h-6 w-6 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex items-center justify-center text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                  {idx + 1}
                </div>
                <div className="h-10 w-10 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">
                    {step.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
