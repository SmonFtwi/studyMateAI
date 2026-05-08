"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

const ShootingStar: React.FC = () => {
  const [style, setStyle] = useState<React.CSSProperties>({ display: "none" });

  useEffect(() => {
    const shoot = () => {
      const top = Math.random() * 50;
      const left = Math.random() * 80 + 10;
      const duration = Math.random() * 2 + 1;
      
      setStyle({
        top: `${top}%`,
        left: `${left}%`,
        display: "block",
        animation: `shooting-star ${duration}s linear`,
      });

      setTimeout(() => {
        setStyle({ display: "none" });
      }, duration * 1000);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.7) shoot();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return <div className="shooting-star" style={style} />;
};

export const CosmicBackground: React.FC = () => {
  const { scrollY } = useScroll();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax layers based on scroll
  const y1 = useTransform(scrollY, [0, 2000], [0, 400]);
  const y2 = useTransform(scrollY, [0, 2000], [0, -200]);
  const y3 = useTransform(scrollY, [0, 2000], [0, 100]);

  // Mouse parallax springs
  const mouseX = useSpring(0, { stiffness: 50, damping: 20 });
  const mouseY = useSpring(0, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set((clientX / innerWidth - 0.5) * 40);
      mouseY.set((clientY / innerHeight - 0.5) * 40);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const [stars, setStars] = useState<{ id: number; x: number; y: number; size: number; duration: number; layer: number }[]>([]);

  useEffect(() => {
    const starCount = 200;
    const newStars = Array.from({ length: starCount }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5,
      duration: Math.random() * 3 + 2,
      layer: Math.floor(Math.random() * 3), // 0, 1, or 2
    }));
    setStars(newStars);
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-slate-50 dark:bg-[#030303]">
      <style jsx global>{`
        @keyframes shooting-star {
          0% { transform: translateX(0) translateY(0) rotate(-45deg) scale(0); opacity: 0; }
          10% { opacity: 1; scale: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(-500px) translateY(500px) rotate(-45deg) scale(0); opacity: 0; }
        }
        .shooting-star {
          position: absolute;
          width: 2px;
          height: 80px;
          background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1));
          z-index: 5;
        }
      `}</style>

      {/* Deep Space Gradients - Nebula Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-600/10 blur-[140px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full bg-blue-500/10 blur-[140px] animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/5 blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
      
      {/* Dynamic Aurora-like streak */}
      <motion.div 
        className="absolute top-[40%] left-[-50%] w-[200%] h-[20%] bg-gradient-to-r from-transparent via-blue-500/5 to-transparent blur-[100px] -rotate-12"
        animate={{ x: ["-20%", "20%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <ShootingStar />
      <ShootingStar />

      {/* Parallax Starfield Layers */}
      {[y1, y2, y3].map((scrollYTransform, layerIndex) => (
        <motion.div
          key={layerIndex}
          style={{ 
            y: scrollYTransform,
            x: layerIndex === 0 ? mouseX : layerIndex === 1 ? useTransform(mouseX, (v) => v * 0.5) : useTransform(mouseX, (v) => v * 1.5),
            translateY: layerIndex === 0 ? mouseY : layerIndex === 1 ? useTransform(mouseY, (v) => v * 0.5) : useTransform(mouseY, (v) => v * 1.5),
          }}
          className="absolute inset-0"
        >
          {stars
            .filter((star) => star.layer === layerIndex)
            .map((star) => (
              <div
                key={star.id}
                className="absolute rounded-full bg-slate-300 dark:bg-white opacity-0 animate-pulse"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  animationDuration: `${star.duration}s`,
                  animationDelay: `${Math.random() * 5}s`,
                  opacity: Math.random() * 0.5 + 0.2,
                  boxShadow: star.size > 1.2 ? `0 0 4px 1px rgba(59, 130, 246, 0.3)` : 'none'
                }}
              />
            ))}
        </motion.div>
      ))}

      {/* Floating Nebula Dust Clouds */}
      <motion.div
        style={{ y: y2 }}
        className="absolute inset-0 opacity-40"
      >
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-blue-800/10 rounded-full blur-[150px] animate-blob" style={{ animationDelay: "4s" }} />
      </motion.div>
    </div>
  );
};
