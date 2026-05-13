"use client";

import React from "react";
import { FolderKanban, User, Sparkles, Bell } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "@/components/theme-mode";
import { motion } from "framer-motion";

export const DashNavBar = () => {
  return (
    <nav className="sticky top-0 z-[100] px-6 py-4 w-full">
      <div className="max-w-[1400px] mx-auto flex justify-between items-center glass-cosmos rounded-2xl border-slate-200 dark:border-white/5 p-2 pr-4 relative overflow-hidden group">
        <div className="hidden dark:block absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              top: ["-100%", "200%"],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute left-0 right-0 h-20 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent skew-y-12"
          />
        </div>

        {/* Left Section: Branding & Projects */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 pl-4 pr-6 border-r border-slate-200 dark:border-white/10 group/logo">
            <div className="relative">
              <div className="hidden dark:block absolute inset-0 bg-blue-500/20 blur-lg rounded-full group-hover/logo:bg-blue-500/40 transition-colors" />
              <img src="/studyMate2.png" alt="StudyMate" className="w-8 h-8 relative z-10" />
            </div>
            <span className="font-black tracking-tighter text-lg hidden md:block">
              STUDY<span className="text-blue-400">MATE</span>
            </span>
          </Link>

          <Link href="/Dashboard">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 text-sm font-bold uppercase tracking-widest text-slate-700 dark:text-blue-100"
            >
              <FolderKanban className="w-4 h-4 text-blue-400" />
              Projects
            </motion.button>
          </Link>
        </div>

        {/* Right Section: System Status & User */}
        <div className="flex items-center gap-3">
          {/* System Notifications */}
          <button className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-all relative group/btn">
            <Bell className="w-4 h-4 text-slate-400 dark:text-blue-300/50 group-hover/btn:text-blue-500 dark:group-hover/btn:text-blue-300" />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          </button>

          <div className="w-px h-8 bg-slate-200 dark:bg-white/10 mx-1" />

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black text-emerald-500/70 uppercase tracking-wider">Neural Link Active</span>
          </div>

          <ModeToggle />
          
          <Link href="/Dashboard/profile">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="p-1 rounded-xl bg-slate-100 dark:bg-gradient-to-br dark:from-blue-500/20 dark:to-indigo-500/20 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-blue-500/50 transition-all relative overflow-hidden group/avatar"
            >
              <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center relative overflow-hidden">
                <User className="w-5 h-5 text-slate-400 dark:text-blue-100/50 group-hover/avatar:text-blue-500 dark:group-hover/avatar:text-blue-100 transition-colors" />
                <div className="hidden dark:block absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
