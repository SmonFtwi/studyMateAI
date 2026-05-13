"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Upload, Sparkles, Trophy, ArrowRight, Brain, Orbit } from "lucide-react";

const steps = [
  {
    title: "SIGN UP",
    description: "Create your free account in seconds and set up your study profile.",
    icon: UserPlus,
    color: "bg-blue-500",
    shadow: "shadow-blue-500/20",
  },
  {
    title: "UPLOAD",
    description: "Drop in your PDFs, notes, or textbooks — we handle the rest.",
    icon: Upload,
    color: "bg-blue-500",
    shadow: "shadow-blue-500/20",
  },
  {
    title: "LEARN",
    description: "AI breaks down your material into summaries, flashcards, and practice quizzes.",
    icon: Brain,
    color: "bg-blue-500",
    shadow: "shadow-blue-500/20",
  },
  {
    title: "SUCCEED",
    description: "Ace your exams with confidence, backed by personalized study tools.",
    icon: Trophy,
    color: "bg-blue-500",
    shadow: "shadow-blue-500/20",
  },
];

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-40 relative overflow-hidden">
      {/* Background Orbital Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] border border-white/5 rounded-full pointer-events-none animate-spin-slow" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          {/* Left: Text Info */}
          <div className="lg:w-1/2 text-left">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1 rounded-full glass-cosmos border-white/10 text-[10px] font-black tracking-[0.3em] text-blue-400 mb-6"
            >
              HOW IT WORKS
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-7xl font-black mb-8 leading-[0.9] tracking-tighter"
            >
              SIMPLE <span className="text-gradient-cosmic italic">STEPS</span> <br />
              TO SUCCESS
            </motion.h2>
            
            <div className="space-y-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  onMouseEnter={() => setActiveStep(index)}
                  className={`cursor-pointer transition-all duration-500 flex gap-6 p-6 rounded-3xl ${activeStep === index ? 'glass-cosmos border-white/20' : 'opacity-30 hover:opacity-100'}`}
                >
                  <div className={`w-12 h-12 rounded-2xl ${step.color} flex items-center justify-center shadow-lg shrink-0`}>
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-blue-100/60 font-medium leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Visual Orbital Diagram */}
          <div className="lg:w-1/2 relative h-[600px] flex items-center justify-center">
            {/* Center Core */}
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: 360 
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="relative w-48 h-48 rounded-full glass-cosmos border-white/20 flex items-center justify-center z-20 shadow-[0_0_100px_rgba(59,130,246,0.3)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full animate-pulse" />
              <Brain className="w-20 h-20 text-white" />
              
              {/* Spinning data particles around core */}
              <div className="absolute inset-[-40px] animate-spin-slow">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full blur-[4px]" />
              </div>
              <div className="absolute inset-[-60px] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '4s' }}>
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-400 rounded-full blur-[2px]" />
              </div>
            </motion.div>

            {/* Orbiting Steps */}
            <div className="absolute inset-0">
                {steps.map((step, index) => {
                    const angle = (index * 90) - 90; // Position in 90 degree increments
                    const radius = 240;
                    const x = Math.cos((angle * Math.PI) / 180) * radius;
                    const y = Math.sin((angle * Math.PI) / 180) * radius;

                    return (
                        <motion.div
                            key={index}
                            animate={{ 
                                x, 
                                y,
                                scale: activeStep === index ? 1.2 : 1,
                                opacity: activeStep === index ? 1 : 0.6
                            }}
                            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 p-4 rounded-3xl glass-cosmos border-white/20 shadow-2xl transition-all duration-500`}
                        >
                            <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center shadow-2xl ${step.shadow}`}>
                                <step.icon className="w-8 h-8 text-white" />
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Connecting SVG Path */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                <defs>
                    <linearGradient id="orbit-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                        <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <circle 
                    cx="50%" cy="50%" r="240" 
                    fill="none" 
                    stroke="url(#orbit-grad)" 
                    strokeWidth="2" 
                    strokeDasharray="10 20"
                    className="animate-spin-slow"
                />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-blue-600/5 rounded-full blur-[140px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[160px] -z-10 animate-pulse" />
    </section>
  );
}
