import Link from "next/link";
import { BookOpen } from "lucide-react";
export default function Brand() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 font-semibold tracking-tight text-lg"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
        <BookOpen size={20} />
      </span>
      StudyMate<span className="muted text-xs font-normal">AI</span>
    </Link>
  );
}
