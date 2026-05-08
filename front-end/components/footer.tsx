"use client";

import React from "react";
import { motion } from "framer-motion";
import { Github, Twitter, Linkedin, Facebook, GraduationCap, Zap, Radio, Globe, ShieldCheck } from "lucide-react";
import Link from "next/link";

const footerLinks = [
  {
    title: "PRODUCT",
    links: [
      { name: "FEATURES", href: "#capabilities" },
      { name: "PRICING", href: "#pricing" },
      { name: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "COMPANY",
    links: [
      { name: "ABOUT US", href: "/about" },
      { name: "CAREERS", href: "#" },
      { name: "CONTACT", href: "#" },
    ],
  },
  {
    title: "LEGAL",
    links: [
      { name: "PRIVACY POLICY", href: "#" },
      { name: "TERMS OF SERVICE", href: "#" },
      { name: "DATA POLICY", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative pt-40 pb-20 overflow-hidden bg-black">
      {/* Top Border with Scanning Effect */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-16 mb-32">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-4 mb-10 group">
              <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)] group-hover:rotate-[15deg] transition-transform duration-500">
                <GraduationCap className="w-8 h-8" />
              </div>
              <span className="text-3xl font-black tracking-tighter">
                STUDYMATE<span className="text-gradient-cosmic">AI</span>
              </span>
            </Link>
            
            <p className="text-xl text-blue-100/30 max-w-sm mb-12 leading-relaxed font-medium">
              Your AI-powered study companion. Upload your materials and let 
              smart tools help you learn faster and ace your exams.
            </p>

            <div className="flex gap-4">
              {[Twitter, Github, Linkedin, Facebook].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ y: -5, scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
                  className="w-12 h-12 rounded-2xl glass-cosmos border border-white/10 flex items-center justify-center transition-all duration-500"
                >
                  <Icon size={20} className="text-white/40" />
                </motion.a>
              ))}
            </div>
          </div>

          {footerLinks.map((section, i) => (
            <div key={i}>
              <h4 className="text-[10px] font-black tracking-[0.5em] text-white/20 mb-10 uppercase">{section.title}</h4>
              <ul className="space-y-6">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <Link
                      href={link.href}
                      className="text-sm font-bold text-blue-100/40 hover:text-white transition-all duration-300 flex items-center group"
                    >
                      <div className="w-0 group-hover:w-4 h-px bg-blue-500 mr-0 group-hover:mr-3 transition-all duration-300" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* System Status Banner */}
        <div className="glass-cosmos rounded-[32px] border-white/5 p-8 flex flex-col md:flex-row justify-between items-center gap-8 mb-20">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[10px] font-black tracking-widest text-green-400 uppercase">All Systems Online</span>
              </div>
              <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
                 <Radio className="w-3 h-3 text-blue-400" />
                 <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase">Fast & Reliable</span>
              </div>
           </div>
           
           <div className="flex items-center gap-8 text-[10px] font-black tracking-widest text-white/20 uppercase">
              <div className="flex items-center gap-2">
                 <Globe className="w-3 h-3" />
                  <span>WORLDWIDE ACCESS</span>
              </div>
              <div className="flex items-center gap-2">
                 <ShieldCheck className="w-3 h-3" />
                  <span>DATA ENCRYPTED</span>
              </div>
           </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black tracking-[0.4em] text-white/10 uppercase">
          <p>© {new Date().getFullYear()} STUDYMATE AI. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-10">
            <Link href="#" className="hover:text-white transition-colors">SECURITY</Link>
            <Link href="#" className="hover:text-white transition-colors">LEGAL</Link>
          </div>
        </div>
      </div>

      {/* Extreme ambient decoration */}
      <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-blue-900/10 to-transparent pointer-events-none -z-10" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />
    </footer>
  );
}
