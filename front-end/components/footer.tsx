import Link from "next/link";
import Brand from "./brand";
export default function Footer() {
  return (
    <footer className="border-t py-10">
      <div className="page-width flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Brand />
          <p className="muted mt-3 text-sm">
            A little more clarity. A better way to study.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm muted">
          <Link href="/about">About</Link>
          <Link href="/ourService">Features</Link>
          <Link href="/#faq">FAQ</Link>
          <span>© {new Date().getFullYear()} StudyMate</span>
        </div>
      </div>
    </footer>
  );
}
