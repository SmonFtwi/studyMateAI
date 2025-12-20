'use client'

import { ArrowRight } from "lucide-react";

const featureLines = [
  {
    label: "Ingest",
    title: "Drop PDFs, slides, sheets",
    description:
      "We extract clean text across formats and prep it for chunking, OCR where needed.",
  },
  {
    label: "Embed",
    title: "Gemini → Pinecone",
    description:
      "text-embedding-004 generates the vectors; Pinecone keeps them scoped to each project.",
  },
  {
    label: "Study",
    title: "Summaries, cards, answers",
    description:
      "Flashcards, concise briefs, and contextual Q&A stay linked to the underlying chunks.",
  },
  {
    label: "Control",
    title: "Version and revisit",
    description:
      "Keep iterations of your uploads and return to past sessions without reprocessing.",
  },
  {
    label: "Signal",
    title: "Progress markers",
    description:
      "Lightweight metrics—what you shipped, recall lift, and how recently you reviewed.",
  },
  {
    label: "Collab",
    title: "Shareable spaces",
    description:
      "Invite peers to view curated flashcards or summaries without exposing raw docs.",
  },
];

export default function FeatureGridSection() {
  return (
    <section className="w-full px-6 md:px-12 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-6 flex-col md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
              Capabilities
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">
              A toolkit built for deliberate study
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 max-w-2xl mt-3">
              Less neon, more signal: every feature is designed to keep your
              attention on the material, not the UI.
            </p>
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-300 flex items-center gap-2">
            Explore the workflow
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {featureLines.map((item, idx) => (
            <div
              key={item.title}
              className="relative overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/60 p-4 shadow-[0_18px_60px_-48px_rgba(0,0,0,0.45)]"
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400 mb-3">
                <span>{item.label}</span>
                <span className="flex items-center gap-1 text-neutral-400">
                  <span className="h-[2px] w-8 bg-neutral-300 dark:bg-neutral-700" />
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
