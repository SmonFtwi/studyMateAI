import Link from "next/link";
import { ArrowRight, BookOpen, Layers, MessageSquare } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import LandingMotion from "@/components/landing/landing-motion";
import WorkspacePreview from "@/components/landing/workspace-preview";

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
      <LandingMotion>
        <main>
          <section className="page-width grid gap-14 py-16 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:py-24">
            <div className="landing-hero-copy">
              <p className="eyebrow mb-6 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />A
                clearer way to learn
              </p>
              <h1 className="text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
                Less scattered.
                <br />
                More{" "}
                <span className="accent landing-highlight">understood.</span>
              </h1>
              <p className="muted mt-6 max-w-md text-lg leading-8">
                Bring your notes together. Ask better questions. Turn what
                you&apos;re learning into what you know.
              </p>
              <div className="landing-cta mt-8 flex flex-wrap gap-3">
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
            <WorkspacePreview />
          </section>
          <section id="how-it-works" className="border-y py-16">
            <div className="page-width landing-reveal">
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
                  <div key={n} className="landing-step landing-reveal">
                    <span className="landing-step-number accent text-sm font-mono">
                      {n}
                    </span>
                    <h3 className="mt-4 text-lg font-medium">{title}</h3>
                    <p className="muted mt-2 text-sm leading-7">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section id="capabilities" className="page-width py-16">
            <div className="landing-reveal flex flex-col sm:flex-row justify-between gap-4">
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
              {features.map(({ icon: Icon, title, text }, index) => (
                <div
                  key={title}
                  className="landing-reveal"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <article className="landing-feature surface h-full rounded-xl p-6">
                    <Icon className="accent mb-8" size={24} />
                    <h3 className="font-medium text-lg">{title}</h3>
                    <p className="muted mt-3 text-sm leading-7">{text}</p>
                  </article>
                </div>
              ))}
            </div>
          </section>
          <section id="faq" className="page-width py-12">
            <div className="landing-reveal mx-auto max-w-2xl">
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
            <div className="landing-reveal landing-cta surface rounded-2xl p-8 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
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
      </LandingMotion>
      <Footer />
    </>
  );
}
