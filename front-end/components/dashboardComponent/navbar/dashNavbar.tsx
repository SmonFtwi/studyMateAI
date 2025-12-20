import React from "react";
import { FolderKanban, User } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "@/components/theme-mode";

export const DashNavBar = () => {
  return (
    <nav className="custom-bg-nav sticky top-0 flex justify-between items-center px-6 py-4 w-full">
      {/* Left Section: Projects Button */}
      <Link href="/Dashboard">
        <button
          className="
          flex items-center gap-2 
          px-4 py-2 rounded-xl
          bg-slate-800/50 hover:bg-slate-800
          border border-slate-700/50 hover:border-slate-600
          transition-all duration-200
          text-gray-200 font-medium
        "
        >
          <FolderKanban className="w-5 h-5 text-blue-400" />
          Projects
        </button>
      </Link>

      {/* Right Section: Mode Toggle and Profile Icon */}
      <div className="flex items-center space-x-4">
        <ModeToggle />
        <button
          className="
            p-2 rounded-xl
            bg-slate-800/50 hover:bg-slate-800
            border border-slate-700/50 hover:border-slate-600
            transition-all duration-200
          "
        >
          <User className="w-5 h-5 text-gray-200" />
        </button>
      </div>
    </nav>
  );
};
