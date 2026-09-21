"use client";

import { useState } from "react";
import {
  BookOpen,
  Check,
  FileText,
  Folder,
  Layers,
  MessageSquare,
  RotateCcw,
  Send,
} from "lucide-react";

type Mode = "chat" | "flashcards" | "quiz";
const modes = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "flashcards", label: "Flashcards", icon: Layers },
  { id: "quiz", label: "Quiz", icon: BookOpen },
] as const;

export default function WorkspacePreview() {
  const [mode, setMode] = useState<Mode>("chat");
  const [flipped, setFlipped] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  return (
    <div className="landing-preview landing-reveal relative min-w-0">
      <div className="landing-orbit" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="landing-preview-window surface relative rounded-2xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4">
          <span className="flex items-center gap-2 text-sm font-medium">
            <Folder size={16} className="accent" />
            Biology · Cell structure
          </span>
          <span className="muted text-xs">Interactive example</span>
        </div>
        <div className="flex">
          <div className="hidden sm:block w-28 shrink-0 border-r p-4 text-xs">
            <p className="muted mb-4">Sources</p>
            <div className="flex gap-2 leading-5">
              <FileText size={16} className="accent shrink-0" />
              Lecture notes.pdf
            </div>
            <div className="landing-source-path mt-5" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className="min-w-0 flex-1 p-4 sm:p-5">
            <div
              role="tablist"
              aria-label="Try a study mode"
              className="flex gap-1 border-b pb-3"
            >
              {modes.map(({ id, label, icon: Icon }, index) => (
                <button
                  key={id}
                  id={`preview-tab-${id}`}
                  role="tab"
                  aria-selected={mode === id}
                  aria-controls={`preview-panel-${id}`}
                  tabIndex={mode === id ? 0 : -1}
                  onClick={() => setMode(id)}
                  onKeyDown={(e) => {
                    if (
                      ["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)
                    ) {
                      e.preventDefault();
                      const next =
                        e.key === "Home"
                          ? 0
                          : e.key === "End"
                            ? 2
                            : (index + (e.key === "ArrowRight" ? 1 : 2)) % 3;
                      setMode(modes[next].id);
                      document
                        .getElementById(`preview-tab-${modes[next].id}`)
                        ?.focus();
                    }
                  }}
                  className={`landing-preview-tab flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs ${mode === id ? "accent bg-blue-500/10" : "muted"}`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
            <div
              key={mode}
              role="tabpanel"
              id={`preview-panel-${mode}`}
              aria-labelledby={`preview-tab-${mode}`}
              tabIndex={0}
              className="landing-preview-content min-h-[350px] pt-5"
            >
              {mode === "chat" ? (
                <>
                  <div className="landing-message landing-message-one ml-5 rounded-xl bg-blue-500/10 px-4 py-3 text-sm">
                    How do mitochondria power a cell?
                  </div>
                  <div className="landing-message landing-message-two mt-6 text-sm leading-7">
                    <div className="accent mb-2 flex items-center gap-2 font-medium">
                      <BookOpen size={16} />
                      StudyMate
                    </div>
                    <p>
                      Mitochondria turn energy from food into{" "}
                      <strong>ATP</strong> — a molecule the cell uses to power
                      its activities.
                    </p>
                    <p className="muted mt-3">
                      Think of ATP as the cell&apos;s rechargeable battery.
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 rounded-md border px-2 text-xs muted">
                      <FileText size={12} />
                      Lecture notes · p. 12
                    </span>
                  </div>
                  <div
                    className="landing-message landing-message-three mt-6 flex items-center justify-between rounded-lg border p-3 text-xs muted"
                    aria-hidden="true"
                  >
                    A little clearer already.
                    <Send size={14} />
                  </div>
                </>
              ) : mode === "flashcards" ? (
                <>
                  <div className="flex justify-between items-center text-xs muted mb-4">
                    <span>One idea at a time</span>
                    <span>Card 1 of 8 · Example</span>
                  </div>
                  <button
                    className={`landing-flashcard ${flipped ? "is-flipped" : ""}`}
                    onClick={() => setFlipped((v) => !v)}
                    aria-label={
                      flipped ? "Show the question" : "Reveal the answer"
                    }
                    aria-pressed={flipped}
                  >
                    <span className="landing-flashcard-inner">
                      <span
                        className="landing-flashcard-face"
                        aria-hidden={flipped}
                      >
                        <Layers size={24} className="accent mx-auto mb-5" />
                        <span className="muted block text-xs mb-3">
                          Question
                        </span>
                        <span className="text-xl font-medium">
                          What is the cell&apos;s energy currency?
                        </span>
                      </span>
                      <span
                        className="landing-flashcard-face landing-flashcard-back"
                        aria-hidden={!flipped}
                      >
                        <span className="accent text-4xl font-semibold">
                          ATP
                        </span>
                        <span className="block text-sm leading-6 mt-4">
                          A molecule that stores and transfers energy for the
                          cell&apos;s activities.
                        </span>
                      </span>
                    </span>
                  </button>
                  <p className="muted mt-4 flex items-center justify-center gap-2 text-xs">
                    <RotateCcw size={13} />
                    Click the card to{" "}
                    {flipped ? "see the question" : "reveal the answer"}
                  </p>
                </>
              ) : (
                <>
                  <p className="muted text-xs mb-4">
                    A quick check · Example question
                  </p>
                  <h3 className="text-lg font-medium mb-5">
                    Where does most cellular ATP production happen?
                  </h3>
                  <div className="space-y-2">
                    {[
                      "The nucleus",
                      "The mitochondria",
                      "The cell membrane",
                    ].map((option, index) => (
                      <button
                        key={option}
                        aria-pressed={answer === option}
                        onClick={() => setAnswer(option)}
                        className={`landing-quiz-option w-full flex items-center gap-3 rounded-lg border p-3 text-left text-sm ${answer === option ? (index === 1 ? "border-emerald-500 bg-emerald-500/10" : "border-amber-500 bg-amber-500/10") : ""}`}
                      >
                        <span className="muted text-xs">
                          {String.fromCharCode(65 + index)}
                        </span>
                        {option}
                        {answer === option && index === 1 && (
                          <Check
                            size={16}
                            className="ml-auto text-emerald-500"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                  <p
                    role="status"
                    className="mt-4 text-xs leading-6 muted min-h-12"
                  >
                    {answer === null
                      ? "Choose an answer to try it out."
                      : answer === "The mitochondria"
                        ? "You’ve got it. Mitochondria generate ATP through cellular respiration."
                        : "Try again. Think of the cell’s power station."}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="landing-preview-caption surface ml-5 -mt-1 relative rounded-b-xl px-5 py-3 flex items-center gap-3 text-xs">
        <Check size={16} className="text-emerald-500 shrink-0" />
        From a confusing concept to a clear next step.
      </div>
    </div>
  );
}
