'use client'

import { ArrowRight } from "lucide-react";

const featureLines = [
  {
    label: "Answer",
    title: "Instant answers from your files",
    description:
      "Ask anything about your uploads and get grounded responses sourced from the right chunks.",
  },
  {
    label: "Flashcards",
    title: "Generate study-ready cards",
    description:
      "Auto-create flashcards from your documents and refine them as you review.",
  },
  {
    label: "Practice",
    title: "Generate quiz questions",
    description:
      "Spin up comprehension checks and practice questions to gauge what you’ve retained.",
  },
  {
    label: "Projects",
    title: "Create focused workspaces",
    description:
      "Group files by subject or course so embeddings, answers, and cards stay organized.",
  },
];

export default function FeatureGridSection() {
  return (
    <section
      id="capabilities"
      className="w-full px-6 md:px-12 py-16"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-6 flex-col md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">
              Capabilities
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              A toolkit built for deliberate study
            </h2>
            <p className="text-white/70 max-w-2xl mt-3">
              Less neon, more signal: every feature is designed to keep your
              attention on the material, not the UI.
            </p>
          </div>
          <div className="text-sm text-white/70 flex items-center gap-2">
            Explore the workflow
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {featureLines.map((item, idx) => (
            <div
              key={item.title}
              className="relative overflow-hidden rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm p-4 shadow-[0_18px_60px_-48px_rgba(0,0,0,0.65)]"
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-white/60 mb-3">
                <span>{item.label}</span>
                <span className="flex items-center gap-1 text-white/40">
                  <span className="h-[2px] w-8 bg-white/20" />
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
