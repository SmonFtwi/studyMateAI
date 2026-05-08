"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, Terminal, Cpu, Zap, Shield, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    category: "FILES",
    icon: Terminal,
    question: "What file types can I upload?",
    answer: "You can upload PDF, DOCX, and TXT files. Our AI will read and analyze your documents to generate study materials.",
  },
  {
    category: "EDITING",
    icon: Cpu,
    question: "Can I edit the generated content?",
    answer: "Absolutely! You have full control to edit summaries, customize flashcards, and adjust quiz questions to fit your needs.",
  },
  {
    category: "ACCESS",
    icon: Zap,
    question: "Can I use StudyMate offline?",
    answer: "An internet connection is required to use StudyMate AI. We're working on offline support for a future update.",
  },
  {
    category: "LANGUAGES",
    icon: Search,
    question: "What languages are supported?",
    answer: "Currently, StudyMate AI works best with English documents. We're actively adding support for more languages.",
  },
  {
    category: "SECURITY",
    icon: Shield,
    question: "How secure is my data?",
    answer: "Your data is protected with encryption and stored securely. We never share your files or personal information with third parties.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-60 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          
          {/* Left Side: Terminal Branding */}
          <div className="sticky top-40">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="w-10 h-[2px] bg-blue-500" />
              <span className="text-xs font-black tracking-[0.5em] text-blue-400 uppercase">Help Center</span>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-[0.9]"
            >
              QUESTIONS <br />
              <span className="text-gradient-cosmic italic">& ANSWERS</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-blue-100/40 font-medium max-w-md leading-relaxed mb-12"
            >
              Got questions? We've got answers. Find everything you need 
              to know about StudyMate AI below.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-cosmos p-8 rounded-3xl border-white/10 hidden lg:block"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <span className="ml-2 text-[10px] font-black text-white/20 tracking-[0.2em]">StudyMate AI</span>
              </div>
              <div className="space-y-3">
                <div className="h-2 w-3/4 bg-white/5 rounded-full" />
                <div className="h-2 w-1/2 bg-white/5 rounded-full" />
                <div className="h-2 w-2/3 bg-white/5 rounded-full" />
              </div>
            </motion.div>
          </div>

          {/* Right Side: Accordion */}
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className={`w-full group text-left transition-all duration-500 ${
                    openIndex === i ? "scale-[1.02]" : "hover:translate-x-2"
                  }`}
                >
                  <div className={`p-8 rounded-[32px] border transition-all duration-500 ${
                    openIndex === i 
                      ? "glass-cosmos border-blue-500/40 bg-blue-500/5 shadow-[0_20px_50px_rgba(59,130,246,0.1)]" 
                      : "bg-white/5 border-white/5 hover:border-white/10"
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-xl transition-all duration-500 ${openIndex === i ? "bg-blue-500 text-black" : "bg-white/5 text-blue-400 group-hover:bg-white/10"}`}>
                             <faq.icon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-black tracking-[0.3em] text-blue-300/40 uppercase">{faq.category}</span>
                       </div>
                       <ChevronDown className={`w-5 h-5 transition-transform duration-500 ${openIndex === i ? "rotate-180 text-white" : "text-white/20"}`} />
                    </div>
                    
                    <h3 className={`text-xl font-black transition-colors duration-500 mt-4 ${openIndex === i ? "text-white" : "text-blue-100/60"}`}>
                      {faq.question}
                    </h3>

                    <AnimatePresence>
                      {openIndex === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <p className="mt-6 text-blue-100/50 leading-relaxed font-medium">
                            {faq.answer}
                          </p>
                          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                             <span className="text-[9px] font-black text-white/10 tracking-[0.3em]">HELPFUL ANSWER</span>
                             <div className="flex gap-1">
                                {[1,2,3,4].map(j => (
                                  <div key={j} className="w-3 h-1 bg-blue-500/20 rounded-full" />
                                ))}
                             </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Dynamic light effects */}
      <div className="absolute top-1/2 left-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[160px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
    </section>
  );
}
