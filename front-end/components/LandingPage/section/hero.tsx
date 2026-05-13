"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, Brain, Zap, Globe } from "lucide-react";
import React, { useState, useEffect } from "react";

const KnowledgeAtom = ({ delay = 0, x = 0, y = 0, icon: Icon }: { delay?: number; x: number; y: number; icon: any }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0.4, 0.8, 0.4],
      scale: [1, 1.2, 1],
      x: [x, x + (Math.random() - 0.5) * 40, x],
      y: [y, y + (Math.random() - 0.5) * 40, y],
    }}
    transition={{ 
      duration: 5 + Math.random() * 5, 
      repeat: Infinity, 
      delay,
      ease: "easeInOut" 
    }}
    className="absolute z-20 pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%` }}
  >
    <div className="glass-cosmos p-3 rounded-full border-white/20 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
      <Icon className="w-5 h-5 text-blue-300" />
    </div>
  </motion.div>
);

export default function HeroSection() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-24">
      {/* Knowledge Atoms Floating around */}
      <KnowledgeAtom x={15} y={25} icon={Brain} delay={0} />
      <KnowledgeAtom x={85} y={30} icon={Zap} delay={1} />
      <KnowledgeAtom x={20} y={75} icon={Globe} delay={2} />
      <KnowledgeAtom x={80} y={80} icon={Sparkles} delay={3} />

      <div className="relative max-w-7xl mx-auto px-6 text-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass-cosmos border-white/20 text-sm font-semibold text-blue-700 dark:text-blue-200 mb-10 shadow-[0_0_30px_rgba(59,130,246,0.15)]"
        >
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]" />
          <span className="tracking-[0.2em] uppercase text-[11px]">Now Available — Start for Free</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-8 leading-[0.9]"
        >
          MASTER YOUR <span className="text-gradient-cosmic italic">STUDIES</span> <br />
          WITH AI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-slate-600 dark:text-blue-100/70 max-w-3xl mx-auto mb-14 leading-relaxed font-medium"
        >
          Transform messy notes into structured knowledge. Get AI-powered 
          summaries, flashcards, and quizzes in seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-32"
        >
          <Link href="/register">
            <Button size="lg" className="rounded-2xl px-12 py-8 bg-white text-black hover:bg-blue-50 font-black text-xl group transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:shadow-[0_20px_60px_rgba(255,255,255,0.2)] hover:-translate-y-1">
              GET STARTED
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Button>
          </Link>
          <Link href="#capabilities">
            <Button size="lg" variant="outline" className="rounded-2xl px-12 py-8 glass-cosmos border-white/20 text-slate-900 dark:text-white hover:bg-slate-200/40 dark:hover:bg-white/10 font-black text-xl backdrop-blur-2xl transition-all hover:-translate-y-1">
              SEE FEATURES
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            perspective: "2000px",
          }}
          className="relative max-w-5xl mx-auto cursor-none group"
        >
          {/* Custom Cursor for image interaction */}
          <motion.div 
            className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-white/50 pointer-events-none z-[100] mix-blend-difference hidden group-hover:block"
            style={{ x: mouseXSpring, y: mouseYSpring }}
          />

          <motion.div
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
            className="relative rounded-[40px] p-2 glass-cosmos border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Animated Glow Border */}
            <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <Image
              src="/studymageDash.png"
              alt="StudyMate dashboard preview"
              width={1600}
              height={900}
              className="w-full h-auto object-cover rounded-[32px] transform transition duration-1000 group-hover:scale-[1.02]"
              priority
            />

            {/* Depth elements (3D layers) */}
            <div 
              style={{ transform: "translateZ(50px)" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none"
            >
              <div className="absolute top-[10%] left-[10%] w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full" />
              <div className="absolute bottom-[10%] right-[10%] w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full" />
            </div>
          </motion.div>

          {/* Floating HUD Elements */}
          <motion.div 
            animate={{ y: [0, -20, 0], rotate: [0, 2, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-12 -right-8 md:-right-16 glass-cosmos p-6 rounded-3xl border-white/20 shadow-2xl hidden lg:block backdrop-blur-3xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-[12px] text-blue-300/60 uppercase font-black tracking-widest">Study Time</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">10x Faster</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 20, 0], rotate: [0, -2, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-12 -left-8 md:-left-16 glass-cosmos p-6 rounded-3xl border-white/20 shadow-2xl hidden lg:block backdrop-blur-3xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-[12px] text-blue-300/60 uppercase font-black tracking-widest">AI Powered</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">Always Ready</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative atmospheric glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-radial-gradient from-blue-500/5 via-transparent to-transparent pointer-events-none -z-10" />
    </section>
  );
}
