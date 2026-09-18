import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  FileText,
  Layers,
  MessageSquare,
  Check,
  Plus,
  Send,
  Folder,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
const features = [
  {
    icon: MessageSquare,
    title: "Talk through the tricky parts",
    text: "Ask questions about your materials and follow the sources behind each answer.",
  },
  {
    icon: Layers,
    title: "Turn notes into recall",
    text: "Generate flashcards from your sources and review one idea at a time.",
  },
  {
    icon: BookOpen,
    title: "Find out what you know",
    text: "Practice with quizzes built from your materials, with feedback as you go.",
  },
];
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <section className="page-width grid gap-14 py-16 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:py-24">
          <div>
            <p className="eyebrow mb-6 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />A clearer
              way to learn
            </p>
            <h1 className="text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
              Less scattered.
              <br />
              More <span className="accent">understood.</span>
            </h1>
            <p className="muted mt-6 max-w-md text-lg leading-8">
              Bring your notes together. Ask better questions. Turn what
              you&apos;re learning into what you know.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12">
                <Link href="/register">
                  Create your study space
                  <ArrowRight size={16} />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12">
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </div>
            <p className="muted mt-5 text-xs">
              Your documents. Your questions. Your pace.
            </p>
          </div>
          <div className="relative">
            <div className="surface rounded-2xl overflow-hidden shadow-xl">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Folder size={16} className="accent" />
                  Biology · Cell structure
                </span>
                <span className="muted text-xs">Example workspace</span>
              </div>
              <div className="flex">
                <div className="hidden sm:block w-32 shrink-0 border-r p-4 text-xs">
                  <p className="muted mb-4">Sources</p>
                  <div className="flex gap-2 leading-5">
                    <FileText size={16} className="accent shrink-0" />
                    Lecture notes.pdf
                  </div>
                  <p className="mt-4 flex items-center gap-1 muted">
                    <Plus size={14} />
                    Add source
                  </p>
                </div>
                <div className="min-w-0 flex-1 p-5">
                  <div className="flex gap-5 border-b pb-3 text-xs">
                    <span className="accent font-medium">Chat</span>
                    <span className="muted">Flashcards</span>
                    <span className="muted">Quiz</span>
                  </div>
                  <div className="my-6 ml-8 rounded-xl bg-blue-500/10 px-4 py-3 text-sm">
                    How do mitochondria power a cell?
                  </div>
                  <div className="text-sm leading-7">
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
                  <div className="mt-8 flex items-center justify-between rounded-lg border p-3 text-xs muted">
                    Ask a follow-up question
                    <Send size={14} />
                  </div>
                </div>
              </div>
            </div>
            <div className="surface ml-8 -mt-1 relative rounded-b-xl px-5 py-3 flex items-center gap-3 text-xs">
              <Check size={16} className="text-emerald-500" />
              From a confusing concept to a clear next step.
            </div>
          </div>
        </section>
        <section id="how-it-works" className="border-y py-16">
          <div className="page-width">
            <p className="eyebrow">From notes to knowledge</p>
            <h2 className="mt-3 text-3xl font-semibold">
              A simple rhythm for every subject.
            </h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {[
                [
                  "01",
                  "Make room for a subject",
                  "Create a project for a course, an exam, or an idea you want to understand.",
                ],
                [
                  "02",
                  "Bring your materials",
                  "Upload your documents and keep your study sources together.",
                ],
                [
                  "03",
                  "Make it make sense",
                  "Ask questions, review flashcards, and check your understanding with a quiz.",
                ],
              ].map(([n, title, text]) => (
                <div key={n}>
                  <span className="accent text-sm font-mono">{n} /</span>
                  <h3 className="mt-4 text-lg font-medium">{title}</h3>
                  <p className="muted mt-2 text-sm leading-7">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="capabilities" className="page-width py-16">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <h2 className="text-3xl font-semibold">
              One workspace.
              <br />
              Different ways to learn.
            </h2>
            <p className="muted max-w-sm text-sm leading-7">
              Move between understanding, remembering, and practicing without
              losing your place.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <article key={title} className="surface rounded-xl p-6">
                <Icon className="accent mb-8" size={24} />
                <h3 className="font-medium text-lg">{title}</h3>
                <p className="muted mt-3 text-sm leading-7">{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="faq" className="page-width py-12">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-semibold mb-8">
              A few things you might wonder.
            </h2>
            {[
              [
                "What can I upload?",
                "StudyMate supports PDF, Word documents (DOCX), spreadsheets (XLSX), CSV, text, and Markdown files.",
              ],
              [
                "How do answers use my notes?",
                "Chat uses sources in the current project to answer your questions. Review the cited material alongside the answer.",
              ],
              [
                "Can I come back to my work?",
                "Your projects, sources, and conversations stay organized in your account. You can also return to generated flashcards and quizzes.",
              ],
            ].map(([q, a]) => (
              <details key={q} className="border-b py-5">
                <summary className="cursor-pointer font-medium">{q}</summary>
                <p className="muted mt-4 text-sm leading-7">{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="page-width py-16">
          <div className="surface rounded-2xl p-8 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="eyebrow mb-3">Start with one subject</p>
              <h2 className="text-3xl font-semibold">
                Make your next study session count.
              </h2>
            </div>
            <Button asChild className="shrink-0">
              <Link href="/register">
                Get started
                <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
