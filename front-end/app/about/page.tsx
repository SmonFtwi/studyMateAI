"use client";

import Navbar from "@/components/navbar";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Globe, Users, Target, Rocket, Heart } from "lucide-react";
import Footer from "@/components/footer";
import { CosmicBackground } from "@/components/LandingPage/CosmicBackground";

const stats = [
  { label: "Students Empowered", value: "50,000+", icon: Users },
  { label: "Questions Answered", value: "1.2M", icon: Target },
  { label: "Countries Reached", value: "120+", icon: Globe },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen text-white bg-[#030303] overflow-x-hidden">
      <CosmicBackground />
      <Navbar />

      <main className="relative z-10 pt-32 pb-24">
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-24"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Our Mission to <span className="text-gradient-cosmic">Elevate Education</span>
            </h1>
            <p className="text-white/60 text-lg leading-relaxed">
              At StudyMate AI, we believe that every student deserves a personalized, intelligent, and efficient learning experience. We're building the future of education, one galaxy at a time.
            </p>
          </motion.div>

          {/* Core Values */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-32">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                  <Rocket className="text-purple-500" /> Who We Are
                </h2>
                <p className="text-white/60 leading-relaxed text-lg">
                  Born out of the need for smarter study tools, StudyMate AI is a team of educators, engineers, and AI researchers dedicated to making learning more accessible and engaging.
                </p>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                  <Heart className="text-pink-500" /> Our Vision
                </h2>
                <p className="text-white/60 leading-relaxed text-lg">
                  We envision a world where technology removes the barriers to knowledge, allowing students to focus on mastery and creativity rather than rote memorization.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-3xl -z-10" />
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop"
                alt="Our Team"
                className="rounded-3xl border border-white/10 shadow-2xl"
              />
            </motion.div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-cosmos p-8 rounded-3xl text-center border-white/5"
              >
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <stat.icon className="text-purple-400 w-6 h-6" />
                </div>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-white/40 font-medium uppercase tracking-wider text-xs">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Join Us Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-cosmos p-12 rounded-[40px] text-center border-white/10 relative overflow-hidden"
          >
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-6">Be Part of the Future</h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10">
                Whether you're a student, educator, or developer, there's a place for you in our cosmic journey. Let's reshape education together.
              </p>
              <Link href="/register">
                <button className="bg-white text-black px-10 py-4 rounded-full font-bold hover:bg-purple-50 transition-colors shadow-xl">
                  Get Started for Free
                </button>
              </Link>
            </div>
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
