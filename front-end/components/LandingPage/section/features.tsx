'use client'

import { ArrowRight, Brain, Zap, Target, Layers } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React, { useRef } from "react";

const featureLines = [
  {
    label: "Answer",
    title: "Instant Knowledge",
    description: "Ask anything about your uploads and get grounded responses sourced from your material.",
    icon: Brain,
    color: "bg-purple-500",
    glow: "rgba(168, 85, 247, 0.3)"
  },
  {
    label: "Flashcards",
    title: "Smart Review",
    description: "Auto-create flashcards from your documents and refine them as you study.",
    icon: Layers,
    color: "bg-purple-500",
    glow: "rgba(168, 85, 247, 0.3)"
  },
  {
    label: "Practice",
    title: "Mastery Quizzes",
    description: "Generate practice questions to gauge your retention and identify gaps.",
    icon: Target,
    color: "bg-purple-500",
    glow: "rgba(168, 85, 247, 0.3)"
  },
  {
    label: "Projects",
    title: "Fluid Workflow",
    description: "Group files by subject or course to keep your universe organized.",
    icon: Zap,
    color: "bg-purple-500",
    glow: "rgba(168, 85, 247, 0.3)"
  },
];

const FeatureCard = ({ item, idx }: { item: any; idx: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const { left, top } = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.1, duration: 0.8 }}
      className="relative group p-1 rounded-[32px] overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-500"
    >
      {/* Background Glow */}
      <motion.div
        className="absolute -inset-[100px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
        style={{
          background: `radial-gradient(circle at ${mouseX}px ${mouseY}px, ${item.glow} 0%, transparent 50%)`,
          maskImage: 'radial-gradient(circle at center, white, transparent 70%)'
        }}
      />

      <div className="relative z-10 p-8 rounded-[28px] bg-[#0A0A0A]/90 h-full">
        <div className={`w-14 h-14 rounded-2xl ${item.color} p-3.5 mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
          <item.icon className="w-full h-full text-white" />
        </div>
        
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-purple-300/30 mb-6 font-black">
          <span>{item.label}</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity">LVL {String(idx + 1).padStart(2, "0")}</span>
        </div>
        
        <h3 className="text-2xl font-black text-white mb-4 group-hover:text-purple-300 transition-colors tracking-tight">
          {item.title}
        </h3>
        <p className="text-base text-purple-100/40 leading-relaxed font-medium group-hover:text-purple-100/60 transition-colors">
          {item.description}
        </p>

        {/* Bottom indicator */}
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-white/10 font-bold">LEARN MORE</span>
            <ArrowRight className="w-4 h-4 text-white/10 group-hover:text-white/50 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </motion.div>
  );
};

export default function FeatureGridSection() {
  return (
    <section id="capabilities" className="w-full px-6 md:px-12 py-40 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 mb-24">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-12 h-[2px] bg-gradient-to-r from-purple-500 to-transparent" />
              <p className="text-xs uppercase tracking-[0.4em] text-purple-400 font-black">
                KEY FEATURES
              </p>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-8 leading-none"
            >
              EVERYTHING <br />
              <span className="text-gradient-cosmic italic">YOU NEED</span>
            </motion.h2>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="group flex flex-col items-start gap-4"
          >
            <p className="text-purple-100/40 max-w-xs text-sm font-medium leading-relaxed">
              Powerful AI tools that help you understand, review, and master any subject.
            </p>
            <div className="flex items-center gap-3 text-sm font-black text-white group cursor-pointer">
              <span>VIEW ALL FEATURES</span>
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {featureLines.map((item, idx) => (
            <FeatureCard key={item.title} item={item} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
