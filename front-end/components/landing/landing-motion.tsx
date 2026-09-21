"use client";

import { useEffect, useRef } from "react";
import "./landing-motion.css";

export default function LandingMotion({
  children,
}: {
  children: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element || !window.IntersectionObserver) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-in-view", "true");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    element
      .querySelectorAll(".landing-reveal")
      .forEach((node) => observer.observe(node));
    element.setAttribute("data-motion-ready", "true");
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={root} className="landing-motion">
      {children}
    </div>
  );
}
