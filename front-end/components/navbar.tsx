"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles, Orbit, Radio, Zap } from "lucide-react";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { motion, AnimatePresence } from "framer-motion";
import { ModeToggle } from "@/components/theme-mode";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeItem, setActiveItem] = useState("home");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    
    const currentPath = window.location.pathname;
    if (currentPath === "/") setActiveItem("home");
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/", label: "HOME", id: "home" },
    { href: "#capabilities", label: "FEATURES", id: "capabilities" },
    { href: "#faq", label: "FAQ", id: "faq" },
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-700 ${
          scrolled ? "py-4" : "py-8"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className={`relative rounded-3xl transition-all duration-700 px-8 py-3 ${
            scrolled 
              ? "glass-cosmos border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl" 
              : "bg-transparent border-transparent"
          }`}>
            {/* Scanning line effect for scrolled state */}
            {scrolled && (
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-0 left-0 w-1/2 h-px bg-blue-500 opacity-50"
              />
            )}

            <div className="flex items-center justify-between h-14">
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-4 group">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-blue-500 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-700"></div>
                    <div className="relative w-12 h-12 rounded-2xl glass-cosmos border border-white/20 overflow-hidden flex items-center justify-center group-hover:rotate-[15deg] transition-transform duration-500 bg-black dark:bg-black">
                      <img
                        src="/studyMate2.png"
                        alt="StudyMate"
                        className="w-full h-full object-cover scale-110"
                      />
                    </div>
                    <div className="absolute -top-1 -right-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-slate-200 dark:border-black animate-pulse" />
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors">
                      STUDYMATE<span className="text-gradient-cosmic">AI</span>
                    </h1>
                  </div>
                </Link>
              </div>

              <div className="flex items-center space-x-12">
                <div className="hidden lg:flex items-center space-x-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setActiveItem(item.id)}
                      className={`relative px-6 py-2 text-[11px] font-black tracking-[0.3em] transition-all duration-300 uppercase ${
                        activeItem === item.id
                          ? "text-slate-900 dark:text-white"
                          : "text-slate-600 hover:text-slate-900 dark:text-blue-100/30 dark:hover:text-white"
                      }`}
                    >
                      {item.label}
                      {activeItem === item.id && (
                        <motion.div 
                          layoutId="nav-glow"
                          className="absolute inset-0 bg-white/5 rounded-xl -z-10" 
                        />
                      )}
                    </Link>
                  ))}
                </div>

                <div className="hidden lg:flex items-center space-x-6">
                  <ModeToggle />
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="text-slate-600 hover:text-slate-900 dark:text-white/40 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5 text-[11px] font-black tracking-[0.3em] uppercase transition-all"
                    >
                      SIGN IN
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="rounded-2xl px-8 h-12 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-blue-50 transition-all font-black text-xs tracking-[0.2em] uppercase shadow-[0_10px_30px_rgba(15,23,42,0.12)] dark:shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:shadow-[0_15px_40px_rgba(15,23,42,0.2)] dark:hover:shadow-[0_15px_40px_rgba(255,255,255,0.2)] hover:-translate-y-0.5">
                      SIGN UP
                    </Button>
                  </Link>
                </div>

                <div className="lg:hidden">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-3 rounded-2xl glass-cosmos border-white/20 text-slate-900 dark:text-white hover:bg-slate-200/40 dark:hover:bg-white/10 transition-colors"
                  >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-6 top-32 z-40 lg:hidden rounded-[40px] glass-cosmos border border-white/20 shadow-2xl p-10 overflow-hidden backdrop-blur-3xl"
          >
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    setActiveItem(item.id);
                    setIsOpen(false);
                  }}
                  className={`text-2xl font-black tracking-tighter p-6 rounded-3xl transition-all ${
                    activeItem === item.id
                      ? "bg-white/10 text-white"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="h-px bg-white/10 my-6" />
              <div className="grid gap-6 pt-2">
                <div className="px-6">
                  <ModeToggle />
                </div>
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full h-16 rounded-2xl border-slate-300 text-slate-900 hover:bg-slate-200/50 dark:border-white/10 dark:text-white dark:hover:bg-white/5 font-black text-lg">
                    SIGN IN
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  <Button className="w-full h-16 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-black font-black text-lg">
                    GET STARTED
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
