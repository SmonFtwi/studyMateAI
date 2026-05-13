"use client";

import { ArrowRight, Rocket, Zap, Radio, Target } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React from "react";

export default function CallToActionSection() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

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
    <section className="py-60 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
            perspective: "1000px"
          }}
          className="relative rounded-[60px] overflow-hidden glass-cosmos border border-white/10 p-16 md:p-32 text-center shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
        >
          {/* Cosmic Vortex Background */}
          <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.2),transparent_70%)] animate-pulse" />
             <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent,rgba(59,130,246,0.05),transparent)] animate-spin-slow" />
          </div>

          {/* Floating UI Bits */}
          <motion.div 
             animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
             transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-20 left-20 hidden lg:flex items-center gap-3 glass-cosmos px-4 py-2 rounded-full border-white/10"
          >
             <Radio className="w-4 h-4 text-blue-400" />
             <span className="text-[10px] font-black tracking-widest text-blue-300/50 uppercase">Free to Use</span>
          </motion.div>

          <motion.div 
             animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
             transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
             className="absolute bottom-20 right-20 hidden lg:flex items-center gap-3 glass-cosmos px-4 py-2 rounded-full border-white/10"
          >
             <Target className="w-4 h-4 text-blue-400" />
             <span className="text-[10px] font-black tracking-widest text-blue-300/50 uppercase">Ready for You</span>
          </motion.div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <motion.div
              style={{ transform: "translateZ(50px)" }}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-[32px] bg-white text-black shadow-2xl mb-12 group"
            >
              <Rocket className="w-10 h-10 group-hover:translate-y-[-4px] group-hover:translate-x-[4px] transition-transform duration-500" />
            </motion.div>
            
            <h2 
              style={{ transform: "translateZ(30px)" }}
              className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white mb-10 tracking-tighter leading-[0.9]"
            >
              READY TO STUDY <br />
              <span className="text-gradient-cosmic italic">SMARTER?</span>
            </h2>
            
            <p 
              style={{ transform: "translateZ(20px)" }}
              className="text-xl md:text-2xl text-slate-600 dark:text-blue-100/40 mb-16 leading-relaxed font-medium"
            >
              Join thousands of students already using AI to study more 
              effectively. Sign up today — it's completely free.
            </p>
            
            <div 
              style={{ transform: "translateZ(60px)" }}
              className="flex flex-col sm:flex-row gap-8 justify-center items-center"
            >
              <Link href="/register">
                <Button size="lg" className="h-20 px-14 rounded-3xl bg-white text-black hover:bg-blue-50 font-black text-2xl shadow-[0_20px_50px_rgba(255,255,255,0.15)] group transition-all hover:-translate-y-2">
                  GET STARTED FREE
                  <ArrowRight className="ml-4 w-7 h-7 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-20 px-14 rounded-3xl glass-cosmos border-white/20 text-slate-900 dark:text-white hover:bg-slate-200/40 dark:hover:bg-white/5 font-black text-2xl backdrop-blur-3xl transition-all hover:-translate-y-1">
                  SIGN IN
                </Button>
              </Link>
            </div>

            {/* Neural lines indicator */}
            <div className="mt-20 flex justify-center gap-2">
               {[...Array(12)].map((_, i) => (
                 <div key={i} className="w-1 h-8 bg-blue-500/20 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
               ))}
            </div>
          </div>
          
          {/* Edge Glows */}
          <div className="absolute top-0 left-1/4 w-1/2 h-px bg-blue-500/30" />
          <div className="absolute bottom-0 left-1/4 w-1/2 h-px bg-blue-500/30" />
        </motion.div>
      </div>

      {/* Extreme atmospheric decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_70%)] pointer-events-none -z-20" />
    </section>
  );
}
