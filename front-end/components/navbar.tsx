'use client'
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button"
import { Menu, X, Sparkles, GraduationCap, Zap } from 'lucide-react';
import { ModeToggle } from "./theme-mode";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('home');

  // Add useEffect to detect current page and set active item
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath === '/') {
      setActiveItem('home');
    } else if (currentPath === '/about') {
      setActiveItem('about');
    } else if (currentPath === '/ourService') {
      setActiveItem('services');
    }
  }, []);

  const navItems = [
    { href: '/', label: 'Home', id: 'home' },
  ];

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full bg-gray-100/95 dark:bg-gray-900/95 border-b dark:border-gray-700 border-gray-200 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="flex items-center">
                  <Avatar className="w-10 h-10 rounded-full">
                    <AvatarImage 
                      src="/studyMate2.png" 
                      alt="StudyMate"
                      className="w-full h-full object-cover"
                    />
                  </Avatar>
                  <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse ml-1" />
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center space-x-2">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      StudyMate
                    </h1>
                    <GraduationCap className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-light">
                    AI-Powered Learning
                  </p>
                </div>
              </Link>
            </div>

            {/* Right: Navigation + Actions */}
            <div className="flex items-center space-x-4">
              {/* Desktop Nav */}
              <div className="hidden lg:flex items-center space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setActiveItem(item.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      activeItem === item.id
                        ? 'text-gray-900 dark:text-white bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-500/50'
                        : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Desktop Buttons */}
              <div className="hidden lg:flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="ghost" className="rounded-lg px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-700/50 border border-gray-300 dark:border-gray-600/50 hover:border-gray-400 dark:hover:border-gray-500/50 transition-all duration-300">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="rounded-lg px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300">
                    <span className="flex items-center space-x-1">
                      <span>Get Started</span>
                      <Zap className="w-4 h-4" />
                    </span>
                  </Button>
                </Link>
                <div className="ml-2 pl-2 border-l border-gray-300 dark:border-gray-600/50">
                  <ModeToggle />
                </div>
              </div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden flex items-center space-x-3">
                <ModeToggle />
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-9 h-9 rounded-lg bg-gray-200/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600/50 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-300/50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="lg:hidden w-full bg-gray-100/95 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
            {/* Mobile Navigation Links */}
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
                    ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-gray-900 dark:text-white border border-blue-500/50'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Mobile Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700/50">
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full py-2.5 rounded-lg border-gray-300 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-800/50">
                  Sign In
                </Button>
              </Link>
              
              <Link href="/register" onClick={() => setIsOpen(false)}>
                <Button className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg">
                  <span className="flex items-center justify-center space-x-2">
                    <span>Get Started</span>
                    <Zap className="w-4 h-4" />
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