"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What file types can I upload?",
    answer:
      "You can upload PDF, Word (DOC/DOCX), or plain text files. We’ll parse and analyze them automatically.",
  },
  {
    question: "Can I edit the generated content?",
    answer:
      "Yes, you can manually adjust summaries, flashcards, and cheat sheets within each project.",
  },

  {
    question: "Can I use StudyMate offline?",
    answer:
      "Currently, an internet connection is required. Offline support is planned for future updates.",
  },
  {
    question: "What languages are supported?",
    answer:
      "Currently, StudyMate works best with English content. Multilingual support is under development.",
  },
  {
    question: "Can I organize multiple subjects or courses?",
    answer:
      "Yes, you can create separate projects for each course, subject, or topic.",
  },
  {
    question: "How accurate are the AI summaries?",
    answer:
      "Summaries are designed for clarity and coverage. You can always refine them manually if needed.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section id="pricing" className="py-24 px-6 text-white">
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-semibold">Frequently Asked Questions</h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Answers to some common questions about StudyMate’s features, usage,
            and privacy.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-white/5 rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm"
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left text-white font-medium focus:outline-none"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 transform transition-transform duration-300 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === i && (
                <div className="px-4 pb-4 text-sm text-white/70">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
