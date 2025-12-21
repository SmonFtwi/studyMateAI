"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.05),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.05),transparent_25%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0c0f1a]/60 to-[#0c0f1a]" />
      <div className="relative max-w-6xl mx-auto px-6 sm:px-10 lg:px-12 pt-20 pb-16 text-center">
        <div className="text-sm uppercase tracking-[0.25em] text-white/70">
          StudyMate
        </div>
        <div className="mt-4 pb-20">
          <div className="mx-auto h-12 w-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-semibold">
            *
          </div>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-[3.75rem] font-semibold leading-tight">
            Your AI-Powered Study Partner
          </h1>
          <p className="mt-4 text-sm font-semibold tracking-[0.28em] text-white/70">
            Transform your study materials into an intelligent knowledge base
            that responds instantly to your questions.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="/register">
              <Button className="rounded-full px-6 py-3 bg-white text-[#0c0f1a] hover:bg-white/90 font-semibold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
        <div className="rounded-[28px] overflow-hidden border border-white/10 shadow-[0_30px_90px_-50px_rgba(0,0,0,0.8)] ">
          <Image
            src="/studymageDash.png"
            alt="StudyMate dashboard preview"
            width={1600}
            height={900}
            className="w-full h-auto object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
