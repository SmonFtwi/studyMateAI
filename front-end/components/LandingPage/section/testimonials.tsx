"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Star, Quote, MessageSquare, ShieldCheck, Zap } from "lucide-react";

const testimonials = [
  {
    name: "Alex Johnson",
    role: "Computer Science Student",
    content: "StudyMate AI has completely changed how I prepare for exams. The personalized study plans are a lifesaver!",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    color: "blue-500/20",
    icon: Zap
  },
  {
    name: "Sarah Williams",
    role: "Medical Student",
    content: "The ability to summarize complex medical papers in seconds is incredible. It saves me hours of manual note-taking.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    color: "blue-500/20",
    icon: MessageSquare
  },
  {
    name: "Michael Chen",
    role: "High School Senior",
    content: "I used to struggle with math, but the step-by-step explanations from StudyMate AI made everything so clear.",
    rating: 4,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    color: "blue-500/20",
    icon: ShieldCheck
  },
];

const TestimonialCard = ({ testimonial, index }: { testimonial: any; index: number }) => {
  const cardRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);
  
  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      ref={cardRef}
      style={{ y: springY, opacity, scale }}
      className="relative group"
    >
      <div className={`glass-cosmos p-10 rounded-[40px] border-white/10 hover:border-white/20 transition-all duration-700 relative overflow-hidden backdrop-blur-3xl h-full`}>
        {/* Signal Pulse */}
        <div className="absolute top-8 right-8">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping absolute" />
          <div className="w-2 h-2 rounded-full bg-blue-500" />
        </div>

        {/* Floating Accent Icon */}
        <div className={`absolute -bottom-6 -right-6 w-24 h-24 bg-${testimonial.color} blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
        
        <div className="flex items-center gap-5 mb-10">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
            <img
              src={testimonial.avatar}
              alt={testimonial.name}
              className="w-16 h-16 rounded-full border-2 border-white/20 relative z-10"
            />
          </div>
          <div>
            <h4 className="font-black text-xl text-white tracking-tight">{testimonial.name}</h4>
            <p className="text-sm text-blue-300/40 uppercase font-bold tracking-widest">{testimonial.role}</p>
          </div>
        </div>

        <div className="flex gap-1.5 mb-8">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < testimonial.rating ? "text-blue-400 fill-blue-400" : "text-white/10"}
            />
          ))}
        </div>

        <div className="relative">
          <Quote className="absolute -top-4 -left-4 text-white/5 w-16 h-16 -z-0" />
          <p className="text-xl text-blue-100/70 font-medium leading-relaxed relative z-10 italic">
            "{testimonial.content}"
          </p>
        </div>

        {/* Transmission Status */}
        <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <testimonial.icon className="w-5 h-5 text-blue-400/30" />
            <span className="text-[10px] font-black tracking-[0.2em] text-white/10 uppercase">Verified Review</span>
          </div>
          <div className="flex gap-1">
             {[1,2,3].map(i => (
               <div key={i} className="w-1 h-3 bg-white/5 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
             ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function TestimonialsSection() {
  return (
    <section className="py-60 relative">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-8 h-px bg-blue-500/50" />
            <span className="text-xs font-black tracking-[0.5em] text-blue-400 uppercase">Student Reviews</span>
            <div className="w-8 h-px bg-blue-500/50" />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-8xl font-black mb-10 tracking-tighter leading-none"
          >
            LOVED BY <br />
            <span className="text-gradient-cosmic italic">STUDENTS</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-xl text-blue-100/40 max-w-2xl font-medium"
          >
            We don't just help you study — we help you succeed. Hear from 
            students who transformed their learning experience.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard 
              key={index} 
              testimonial={testimonial} 
              index={index} 
            />
          ))}
        </div>
      </div>

      {/* Atmospheric backgrounds */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-blue-600/10 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-indigo-600/10 blur-[140px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
    </section>
  );
}
