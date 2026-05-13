"use client";

import React from "react";
import {
  ArrowLeft,
  Brain,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Cpu,
  FileWarning,
  Orbit,
  Send,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

interface ProjectWorkspaceProps {
  activeTab: "sources" | "chat" | "tools";
  toolView: "none" | "flashcards" | "quiz";
  selectedSessionId: string | null;
  chatLoading: boolean;
  messages: { role: "user" | "assistant"; text: string; sources?: any[] }[];
  isTyping: boolean;
  scrollRef: React.RefObject<HTMLDivElement>;
  chatInput: string;
  setChatInput: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: (e: React.FormEvent<HTMLFormElement>) => void;
  generatingTool: boolean;
  flashcards: any[];
  currentCardIndex: number;
  setCurrentCardIndex: React.Dispatch<React.SetStateAction<number>>;
  isFlipped: boolean;
  setIsFlipped: React.Dispatch<React.SetStateAction<boolean>>;
  projectId: string;
  setToolView: React.Dispatch<
    React.SetStateAction<"none" | "flashcards" | "quiz">
  >;
  quizQuestions: any[];
  quizIndex: number;
  setQuizIndex: React.Dispatch<React.SetStateAction<number>>;
  quizScore: number | null;
  setQuizScore: React.Dispatch<React.SetStateAction<number | null>>;
  selectedOption: string | null;
  setSelectedOption: React.Dispatch<React.SetStateAction<string | null>>;
  quizFinished: boolean;
  setQuizFinished: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({
  activeTab,
  toolView,
  selectedSessionId,
  chatLoading,
  messages,
  isTyping,
  scrollRef,
  chatInput,
  setChatInput,
  handleSendMessage,
  generatingTool,
  flashcards,
  currentCardIndex,
  setCurrentCardIndex,
  isFlipped,
  setIsFlipped,
  projectId,
  setToolView,
  quizQuestions,
  quizIndex,
  setQuizIndex,
  quizScore,
  setQuizScore,
  selectedOption,
  setSelectedOption,
  quizFinished,
  setQuizFinished,
}) => {
  return (
    <main
      className={`glass-cosmos rounded-[2rem] p-4 lg:p-6 flex flex-col gap-4 h-full flex-1 transition-all duration-500 border-slate-200 dark:border-white/5 relative overflow-hidden group/main lg:order-2 ${
        activeTab === "chat" ? "" : "hidden lg:flex"
      }`}
    >
      <div className="absolute inset-0 pointer-events-none dashboard-panel-atmosphere opacity-70 dark:opacity-[0.03] z-10" />

      {toolView === "none" ? (
        <>
          <div className="flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Brain className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] block">
                  Chat
                </span>
                <span className="text-[8px] font-black text-emerald-400/50 uppercase tracking-[0.1em]">
                  {selectedSessionId
                    ? `Session: ${selectedSessionId.slice(-6).toUpperCase()}`
                    : "Start a new chat"}
                </span>
              </div>
            </div>

            {selectedSessionId && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest">
                  Online
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-4 overflow-hidden z-20">
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto space-y-4 pr-2 scroll-smooth custom-scrollbar"
            >
              {chatLoading && (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex gap-4 max-w-[80%]">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 animate-pulse shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-full rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                        </div>
                        <div className="h-4 w-2/3 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!chatLoading && messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center space-y-6"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse" />
                    <Sparkles className="h-16 w-16 text-blue-400 relative z-10" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">
                      Ask anything
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-white/30 uppercase font-bold tracking-widest max-w-xs leading-relaxed">
                      Ask questions about your files, or use flashcards and quiz
                      tools.
                    </p>
                  </div>
                </motion.div>
              )}

              {!chatLoading &&
                messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{
                      opacity: 0,
                      y: 10,
                      x: msg.role === "user" ? 10 : -10,
                    }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-5 py-4 text-[13px] leading-relaxed relative group/msg ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 text-slate-900 dark:text-white shadow-[0_0_20px_rgba(59,130,246,0.1)] rounded-tr-none"
                          : "bg-slate-100 dark:bg-white/[0.03] border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white/90 rounded-tl-none shadow-[0_0_20px_rgba(255,255,255,0.02)]"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="absolute inset-0 pointer-events-none message-atmosphere opacity-80 dark:opacity-[0.02] rounded-2xl overflow-hidden" />
                      )}

                      <div className="relative z-10">
                        {msg.text}

                        {msg.role === "assistant" &&
                          msg.sources &&
                          msg.sources.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex flex-wrap gap-2">
                              <span className="text-[9px] uppercase tracking-[0.2em] font-black text-slate-500 dark:text-white/30 block w-full mb-1">
                                Sources
                              </span>
                              {msg.sources.map((src, sIdx) => (
                                <div key={sIdx} className="group/src relative">
                                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[9px] font-black border border-blue-500/20 transition-all hover:bg-blue-500/20 hover:border-blue-500/40 cursor-help uppercase tracking-widest">
                                    {src.label}
                                  </span>
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-4 glass-cosmos border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-[10px] rounded-2xl opacity-0 group-hover/src:opacity-100 pointer-events-none transition-all duration-300 z-50 shadow-2xl scale-95 group-hover/src:scale-100 backdrop-blur-xl">
                                    <p className="font-black border-b border-slate-200 dark:border-white/10 pb-2 mb-2 truncate text-blue-400 uppercase tracking-widest">
                                      {src.metadata?.filename || "File snippet"}
                                    </p>
                                    <p className="line-clamp-4 italic text-slate-600 dark:text-white/60 leading-relaxed font-medium">
                                      "{src.metadata?.chunk?.slice(0, 150)}..."
                                    </p>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-200 dark:border-t-white/10" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    </div>
                  </motion.div>
                ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl rounded-tl-none px-5 py-4 flex gap-2 items-center">
                    <div className="flex gap-1.5 items-center">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 1, 0.3],
                        }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                        className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                      />
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          delay: 0.2,
                        }}
                        className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                      />
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          delay: 0.4,
                        }}
                        className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                      />
                    </div>
                    <span className="text-[9px] font-black text-emerald-500 dark:text-emerald-400/70 uppercase tracking-widest ml-1">
                      Thinking...
                    </span>
                  </div>
                </motion.div>
              )}
            </div>

            <form
              className="relative flex items-center gap-3 z-20 mt-2"
              onSubmit={handleSendMessage}
            >
              <div className="absolute left-4 pointer-events-none">
                <Terminal className="w-4 h-4 text-blue-500/50" />
              </div>
              <input
                className="flex-1 rounded-2xl bg-slate-100 dark:bg-white/[0.02] border border-slate-300 dark:border-white/10 pl-12 pr-14 py-4 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                placeholder="Type your question..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 group/send"
                aria-label="Execute command"
              >
                <Send className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </form>
          </div>
        </>
      ) : toolView === "flashcards" ? (
        <div className="flex flex-col h-full z-20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setToolView("none")}
                className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <div>
                <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] block">
                  Flashcards
                </span>
                <span className="text-[8px] font-black text-amber-400/50 uppercase tracking-[0.1em]">
                  Project: {projectId.slice(-6).toUpperCase()}
                </span>
              </div>
            </div>
            {!generatingTool && flashcards.length > 0 && (
              <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 flex items-center gap-2">
                <span className="text-[9px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest">
                  Progress
                </span>
                <span className="text-[10px] font-black text-amber-400 tracking-widest">
                  {currentCardIndex + 1}/{flashcards.length}
                </span>
              </div>
            )}
          </div>

          {generatingTool ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-8">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
                <div className="absolute inset-4 rounded-full border-2 border-blue-500/20 border-b-blue-500 animate-spin-reverse" />
                <Zap className="absolute inset-0 m-auto w-8 h-8 text-amber-400 animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] animate-pulse">
                  Creating flashcards
                </p>
                <p className="text-[8px] font-black text-slate-500 dark:text-white/30 uppercase tracking-[0.2em]">
                  Please wait...
                </p>
              </div>
            </div>
          ) : flashcards.length > 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-full max-w-xl perspective-2000 group">
                <motion.div
                  className="relative w-full aspect-[16/10] preserve-3d cursor-pointer"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    duration: 0.6,
                  }}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <div className="absolute inset-0 backface-hidden glass-cosmos border border-slate-200 dark:border-white/10 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center shadow-2xl overflow-hidden group-hover:border-amber-500/30 transition-colors">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                    <div className="absolute top-10 left-10 w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-amber-400" />
                    </div>

                    <div className="space-y-6">
                      <span className="text-[12px] font-black text-amber-500/50 uppercase tracking-[0.4em] block">
                        Question
                      </span>
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight max-w-lg">
                        {flashcards[currentCardIndex].question}
                      </h3>
                    </div>

                    <div className="absolute bottom-10 flex flex-col items-center gap-2">
                      <span className="text-[8px] font-black text-slate-500 dark:text-white/20 uppercase tracking-[0.3em] animate-pulse">
                        Click to reveal answer
                      </span>
                      <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/10"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-0 backface-hidden glass-cosmos border border-emerald-500/30 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center shadow-2xl rotate-y-180 bg-emerald-500/[0.03] overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

                    <div className="absolute top-10 left-10 w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    </div>

                    <div className="space-y-6">
                      <span className="text-[12px] font-black text-emerald-500/50 uppercase tracking-[0.4em] block">
                        Answer
                      </span>
                      <div className="relative">
                        <div className="absolute -inset-4 bg-emerald-500/5 blur-2xl rounded-full" />
                        <p className="relative text-2xl font-bold text-slate-900 dark:text-white/90 leading-relaxed italic tracking-tight max-w-lg">
                          {flashcards[currentCardIndex].answer}
                        </p>
                      </div>
                    </div>

                    <div className="absolute bottom-10 flex flex-col items-center gap-2">
                      <span className="text-[8px] font-black text-emerald-500/50 uppercase tracking-[0.3em]">
                        Done
                      </span>
                      <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="w-4 h-0.5 rounded-full bg-emerald-500/20"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="mt-12 flex items-center gap-6">
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : prev));
                  }}
                  disabled={currentCardIndex === 0}
                  className="px-8 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-[10px] font-black text-slate-600 dark:text-white/40 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 hover:border-slate-400 dark:hover:border-white/20 transition-all disabled:opacity-10 active:scale-95 flex items-center gap-2 group/btn"
                >
                  <ChevronLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
                  Previous
                </button>

                <div className="flex gap-2">
                  {flashcards
                    .slice(
                      Math.max(0, currentCardIndex - 2),
                      Math.min(flashcards.length, currentCardIndex + 3)
                    )
                    .map((_, i) => {
                      const actualIdx = i + Math.max(0, currentCardIndex - 2);
                      return (
                        <div
                          key={actualIdx}
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            actualIdx === currentCardIndex
                              ? "w-8 bg-amber-400"
                              : "w-1.5 bg-slate-300 dark:bg-white/10"
                          }`}
                        />
                      );
                    })}
                </div>

                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIndex((prev) =>
                      prev < flashcards.length - 1 ? prev + 1 : prev
                    );
                  }}
                  disabled={currentCardIndex === flashcards.length - 1}
                  className="px-8 py-4 rounded-2xl bg-blue-600 text-[10px] font-black text-white uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-10 active:scale-95 flex items-center gap-2 group/btn"
                >
                  Next
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                <FileWarning className="w-8 h-8 text-slate-400 dark:text-white/20" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest">
                  No flashcards yet
                </p>
                <p className="text-[8px] font-bold text-slate-500 dark:text-white/20 uppercase tracking-widest">
                  Generate flashcards from the tools panel
                </p>
              </div>
            </div>
          )}
        </div>
      ) : toolView === "quiz" ? (
        <div className="flex flex-col h-full z-20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setToolView("none")}
                className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <div>
                <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] block">
                  Quiz
                </span>
                <span className="text-[8px] font-black text-emerald-400/50 uppercase tracking-[0.1em]">
                  Project: {projectId.slice(-6).toUpperCase()}
                </span>
              </div>
            </div>
            {!quizFinished && quizQuestions.length > 0 && (
              <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 flex items-center gap-2">
                <span className="text-[9px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest">
                  Question
                </span>
                <span className="text-[10px] font-black text-emerald-400 tracking-widest">
                  {quizIndex + 1}/{quizQuestions.length}
                </span>
              </div>
            )}
          </div>

          {generatingTool ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-8">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                <div className="absolute inset-4 rounded-full border-2 border-blue-500/20 border-b-blue-500 animate-spin-reverse" />
                <Cpu className="absolute inset-0 m-auto w-8 h-8 text-emerald-400 animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] animate-pulse">
                  Creating quiz
                </p>
                <p className="text-[8px] font-black text-slate-500 dark:text-white/30 uppercase tracking-[0.2em]">
                  Please wait...
                </p>
              </div>
            </div>
          ) : quizFinished ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-10 animate-in zoom-in-95 duration-700">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 blur-[100px] opacity-20 animate-pulse" />
                <div className="relative h-48 w-48 rounded-full border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center bg-slate-50/80 dark:bg-white/[0.02] backdrop-blur-3xl shadow-2xl">
                  <svg className="absolute -rotate-90 h-full w-full p-2">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="transparent"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="4"
                    />
                    <motion.circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="transparent"
                      stroke="url(#emerald-gradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      initial={{
                        strokeDasharray: "552.92",
                        strokeDashoffset: "552.92",
                      }}
                      animate={{
                        strokeDashoffset:
                          552.92 *
                          (1 - (quizScore || 0) / quizQuestions.length),
                      }}
                      transition={{
                        duration: 1.5,
                        ease: "easeOut",
                        delay: 0.5,
                      }}
                    />
                    <defs>
                      <linearGradient
                        id="emerald-gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-[0.2em] mb-1">
                      Score
                    </span>
                    <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                      {Math.round(
                        ((quizScore || 0) / quizQuestions.length) * 100
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-3">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">
                  Quiz complete
                </h3>
                <p className="text-[10px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-[0.1em]">
                  Result: <span className="text-emerald-400">{quizScore}</span>{" "}
                  / {quizQuestions.length} correct
                </p>
              </div>

              <div className="flex gap-4 w-full max-w-sm">
                <button
                  onClick={() => {
                    setQuizFinished(false);
                    setQuizIndex(0);
                    setQuizScore(null);
                    setSelectedOption(null);
                  }}
                  className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-[10px] font-black text-slate-700 dark:text-white uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95"
                >
                  Try again
                </button>
                <button
                  onClick={() => setToolView("none")}
                  className="flex-1 px-6 py-4 rounded-2xl bg-blue-600 text-[10px] font-black text-white uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                >
                  Back to chat
                </button>
              </div>
            </div>
          ) : quizQuestions.length > 0 ? (
            <div className="flex-1 flex flex-col space-y-8 overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-6">
                <div className="glass-cosmos rounded-[2.5rem] p-10 border border-slate-200 dark:border-white/10 relative overflow-hidden group/quiz">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <div className="absolute top-8 left-8 w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Terminal className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-xl font-black text-slate-900 dark:text-white leading-relaxed tracking-tight pl-12">
                    {quizQuestions[quizIndex].question}
                  </p>
                </div>

                <div className="grid gap-4">
                  {quizQuestions[quizIndex].options.map(
                    (opt: string, optIdx: number) => {
                      const isSelected = selectedOption === opt;
                      const isCorrect =
                        opt === quizQuestions[quizIndex].correctAnswer;
                      const showResult = selectedOption !== null;

                      return (
                        <button
                          key={opt}
                          disabled={showResult}
                          onClick={() => setSelectedOption(opt)}
                          className={`w-full text-left px-8 py-5 rounded-[1.5rem] border transition-all duration-300 flex items-center justify-between group relative overflow-hidden ${
                            isSelected
                              ? isCorrect
                                ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                                : "bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                              : showResult && isCorrect
                                ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-400/70"
                                : "bg-slate-100 dark:bg-white/[0.02] border-slate-300 dark:border-white/10 text-slate-700 dark:text-white/60 hover:border-slate-400 dark:hover:border-white/20 hover:bg-slate-200 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black opacity-20 uppercase tracking-widest">
                              0{optIdx + 1}
                            </span>
                            <span className="font-bold tracking-tight">
                              {opt}
                            </span>
                          </div>
                          {showResult && isCorrect && (
                            <CheckCircle className="h-5 w-5 text-emerald-400 animate-in zoom-in duration-300" />
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <X className="h-5 w-5 text-red-400 animate-in zoom-in duration-300" />
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 mt-auto">
                <button
                  onClick={() => {
                    setQuizIndex(0);
                    setQuizScore(null);
                    setSelectedOption(null);
                  }}
                  className="text-[9px] font-black text-slate-500 dark:text-white/20 uppercase tracking-[0.2em] hover:text-slate-700 dark:hover:text-white/40 transition-colors"
                >
                  Restart quiz
                </button>
                {selectedOption && (
                  <button
                    onClick={() => {
                      const isCorrect =
                        selectedOption ===
                        quizQuestions[quizIndex].correctAnswer;

                      if (quizIndex < quizQuestions.length - 1) {
                        setQuizScore(
                          (prev) => (prev || 0) + (isCorrect ? 1 : 0)
                        );
                        setQuizIndex((prev) => prev + 1);
                        setSelectedOption(null);
                      } else {
                        const finalScore =
                          (quizScore || 0) + (isCorrect ? 1 : 0);
                        setQuizScore(finalScore);
                        setQuizFinished(true);
                      }
                    }}
                    className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 group"
                  >
                    {quizIndex === quizQuestions.length - 1
                      ? "Finish quiz"
                      : "Next question"}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                <FileWarning className="w-8 h-8 text-slate-400 dark:text-white/20" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest">
                  No quiz yet
                </p>
                <p className="text-[8px] font-bold text-slate-500 dark:text-white/20 uppercase tracking-widest">
                  Generate a quiz from the tools panel
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center">
          <div className="space-y-6">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl animate-pulse" />
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { repeat: Infinity, duration: 20, ease: "linear" },
                  scale: { repeat: Infinity, duration: 4, ease: "easeInOut" },
                }}
                className="relative w-full h-full border border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center backdrop-blur-sm"
              >
                <Orbit className="w-12 h-12 text-blue-400" />
              </motion.div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">
                Tools panel
              </h3>
              <p className="text-[10px] font-bold text-slate-500 dark:text-white/20 uppercase tracking-widest leading-relaxed">
                Choose flashcards or quiz
                <br />
                from the left panel
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProjectWorkspace;
