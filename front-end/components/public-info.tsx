import Link from "next/link";
import Navbar from "./navbar";
import Footer from "./footer";
import { Button } from "./ui/button";
import { ArrowRight, BookOpen, Files, MessageSquare } from "lucide-react";
export default function PublicInfo({ about = false }: { about?: boolean }) {
  return (
    <>
      <Navbar />
      <main className="page-width py-16 sm:py-24">
        <p className="eyebrow">
          {about ? "About StudyMate" : "Made for your study routine"}
        </p>
        <h1 className="page-heading mt-4 max-w-2xl leading-tight">
          {about
            ? "More understanding. Less getting lost in your notes."
            : "Everything you need to work through your material."}
        </h1>
        <p className="muted mt-6 max-w-2xl text-lg leading-8">
          {about
            ? "StudyMate brings your materials and study tools into one focused workspace. Start with what you’re learning, then explore it in the way that works for you."
            : "Organize your sources, ask questions, and practice what you’ve learned — all within the same project."}
        </p>
        <div className="grid md:grid-cols-3 gap-5 my-14">
          {[
            {
              icon: Files,
              title: "A home for each subject",
              text: "Keep related documents in a project so your study sessions have a clear starting point.",
            },
            {
              icon: MessageSquare,
              title: "Questions with context",
              text: "Discuss your materials and use citations to return to the original source.",
            },
            {
              icon: BookOpen,
              title: "Practice with purpose",
              text: "Generate flashcards and quizzes to review concepts and test your understanding.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <article key={title} className="surface rounded-xl p-7">
              <Icon className="accent mb-8" />
              <h2 className="text-xl font-medium">{title}</h2>
              <p className="muted mt-3 leading-7 text-sm">{text}</p>
            </article>
          ))}
        </div>
        <div className="border-t pt-10">
          <h2 className="text-2xl font-semibold mb-4">
            Your next step is a small one.
          </h2>
          <p className="muted mb-6">
            Create a project and add your first study material.
          </p>
          <Button asChild>
            <Link href="/register">
              Create your account
              <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
