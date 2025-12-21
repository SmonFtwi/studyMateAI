"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles } from "lucide-react";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("home");

  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath === "/") {
      setActiveItem("home");
    }
  }, []);

  const navItems = [
    { href: "/", label: "Home", id: "home" },
    { href: "#capabilities", label: "Capabilities", id: "capabilities" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-sm bg-gradient-to-b from-[#0c0f1a]/90 via-[#0c0f1a]/45 to-transparent  text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="flex items-center">
                  <Avatar className="w-9 h-9 rounded-full border border-white/20">
                    <AvatarImage
                      src="/studyMate2.png"
                      alt="StudyMate"
                      className="w-full h-full object-cover"
                    />
                  </Avatar>
                  <Sparkles className="w-3 h-3 text-amber-300 animate-pulse ml-1" />
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center space-x-2">
                    <h1 className="text-lg font-semibold">StudyMate</h1>
                  </div>
                  <p className="text-[11px] text-white/60 font-light">
                    AI-Powered Study Partner
                  </p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden lg:flex items-center space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setActiveItem(item.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      activeItem === item.id
                        ? "bg-white/10 border border-white/20 text-white"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="hidden lg:flex items-center space-x-3">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="rounded-full px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 border border-white/20 transition-all"
                  >
                    Sign in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="rounded-full px-4 py-2 bg-white text-[#0c0f1a] hover:bg-white/90 transition-all font-semibold shadow-lg">
                    Sign Up
                  </Button>
                </Link>
              </div>

              <div className="lg:hidden flex items-center space-x-3">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/15 transition-colors"
                >
                  {isOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {isOpen && (
        <div className="lg:hidden w-full bg-[#0c0f1a]/95 border-b border-white/10 shadow-lg text-white">
          <div className="max-w-6xl mx-auto px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => {
                  setActiveItem(item.id);
                  setIsOpen(false);
                }}
                className={`block py-3 px-4 rounded-lg text-base font-medium transition-all duration-200 ${
                  activeItem === item.id
                    ? "bg-white/10 border border-white/20 text-white"
                    : "text-white/80 hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <div className="space-y-3 pt-4 border-t border-white/10">
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full py-2.5 rounded-lg border-white/25 text-white hover:bg-white/10"
                >
                  Sign in
                </Button>
              </Link>

              <Link href="/register" onClick={() => setIsOpen(false)}>
                <Button className="w-full py-2.5 rounded-lg bg-white text-[#0c0f1a] border-0 shadow-lg">
                  <span className="flex items-center justify-center space-x-2">
                    <span>Start free trial</span>
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
