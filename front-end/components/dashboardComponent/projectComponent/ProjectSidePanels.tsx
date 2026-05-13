"use client";

import React from "react";
import {
  CheckCircle,
  Cpu,
  Database,
  ExternalLink,
  FileText,
  History,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Search,
  Shuffle,
  Upload,
  Workflow,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface ProjectSidePanelsProps {
  activeTab: "sources" | "chat" | "tools";
  showSources: boolean;
  setShowSources: React.Dispatch<React.SetStateAction<boolean>>;
  showTools: boolean;
  setShowTools: React.Dispatch<React.SetStateAction<boolean>>;
  loadingFiles: boolean;
  projectFiles: { file_id: string; filename: string }[];
  isDragging: boolean;
  selectedFiles: File[];
  uploading: boolean;
  uploadStatus: "idle" | "success" | "error";
  statusMessage: string;
  sessionsLoading: boolean;
  chatSessions: { _id: string; title: string; updatedAt: string }[];
  selectedSessionId: string | null;
  generatingTool: boolean;
  flashcards: any[];
  quizQuestions: any[];
  setToolView: React.Dispatch<
    React.SetStateAction<"none" | "flashcards" | "quiz">
  >;
  handleDrop: React.DragEventHandler<HTMLDivElement>;
  handleDragOver: React.DragEventHandler<HTMLDivElement>;
  handleDragLeave: () => void;
  handleFileInput: React.ChangeEventHandler<HTMLInputElement>;
  removeFile: (index: number) => void;
  handleUpload: () => void;
  handleCreateSession: () => void;
  handleSelectSession: (sessionId: string) => void;
  handleGenFlashcards: () => void;
  handleGenQuiz: () => void;
}

const ProjectSidePanels: React.FC<ProjectSidePanelsProps> = ({
  activeTab,
  showSources,
  setShowSources,
  showTools,
  setShowTools,
  loadingFiles,
  projectFiles,
  isDragging,
  selectedFiles,
  uploading,
  uploadStatus,
  statusMessage,
  sessionsLoading,
  chatSessions,
  selectedSessionId,
  generatingTool,
  flashcards,
  quizQuestions,
  setToolView,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  handleFileInput,
  removeFile,
  handleUpload,
  handleCreateSession,
  handleSelectSession,
  handleGenFlashcards,
  handleGenQuiz,
}) => {
  return (
    <>
      <aside
        className={`${
          activeTab === "sources" ? "" : "hidden lg:flex"
        } glass-cosmos rounded-[2rem] p-4 lg:p-6 flex flex-col gap-6 h-full flex-1 transition-all duration-500 border-slate-200 dark:border-white/5 relative overflow-hidden group/aside lg:order-3`}
      >
        {showSources ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Database className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] block">
                    Project Files
                  </span>
                  <span className="text-[8px] font-black text-blue-400/50 uppercase tracking-[0.1em]">
                    {loadingFiles
                      ? "Scanning..."
                      : `${projectFiles.length} Modules Linked`}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowSources(false)}
                className="hidden lg:flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-500 dark:text-white/40 hover:text-slate-800 dark:hover:text-white hover:border-slate-400 dark:hover:border-white/20 transition-all"
                aria-label="Collapse sources"
              >
                <PanelRightClose className="h-4 w-4" />
              </button>
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative rounded-2xl border border-dashed transition-all duration-300 group/upload ${
                isDragging
                  ? "border-blue-500 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                  : "border-slate-300 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:border-slate-400 dark:hover:border-white/20"
              }`}
            >
              <div className="p-6 flex flex-col items-center justify-center text-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isDragging
                      ? "bg-blue-500 text-white scale-110"
                      : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/30"
                  }`}
                >
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-700 dark:text-white/60 uppercase tracking-widest mb-1">
                    Upload files
                  </p>
                  <label className="text-[9px] font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer flex items-center gap-1 justify-center">
                    <Search className="w-3 h-3" />
                    Browse files
                    <input
                      type="file"
                      hidden
                      multiple
                      onChange={handleFileInput}
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>
              {isDragging && (
                <div className="absolute inset-0 border-beam rounded-2xl" />
              )}
            </div>

            <AnimatePresence>
              {selectedFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[9px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest">
                      Upload queue ({selectedFiles.length})
                    </span>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                    {selectedFiles.map((file, idx) => (
                      <motion.div
                        key={`${file.name}-${idx}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between text-[10px] font-bold text-slate-700 dark:text-white/80 bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2.5"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <button
                          className="text-slate-400 dark:text-white/20 hover:text-red-400 transition-colors"
                          onClick={() => removeFile(idx)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                      uploading
                        ? "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/20 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02]"
                    }`}
                  >
                    {uploading ? "Uploading files..." : "Upload files"}
                  </button>
                  {statusMessage && (
                    <p
                      className={`text-[9px] font-bold uppercase tracking-widest text-center ${
                        uploadStatus === "error"
                          ? "text-red-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {statusMessage}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 overflow-hidden flex flex-col gap-3">
              <span className="text-[9px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest px-1">
                Uploaded files
              </span>
              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                <AnimatePresence mode="popLayout">
                  {loadingFiles ? (
                    [1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-12 w-full rounded-xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 animate-pulse relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                      </div>
                    ))
                  ) : projectFiles.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-[10px] font-bold text-slate-500 dark:text-white/20 uppercase tracking-widest leading-loose">
                        No files found
                        <br />
                        Upload files to get started
                      </p>
                    </div>
                  ) : (
                    projectFiles.map((file, idx) => (
                      <motion.div
                        key={file.file_id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-[11px] font-bold text-slate-700 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/[0.05] hover:border-slate-300 dark:hover:border-white/10 hover:text-slate-900 dark:hover:text-white transition-all cursor-default group/file"
                      >
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center group-hover/file:bg-red-500/20 transition-all">
                          <FileText className="h-4 w-4 text-red-400" />
                        </div>
                        <span className="truncate flex-1">{file.filename}</span>
                        <div className="text-[8px] font-black text-slate-400 dark:text-white/10 uppercase group-hover/file:text-slate-600 dark:group-hover/file:text-white/30 transition-colors">
                          ID {file.file_id.slice(-4).toUpperCase()}
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-white/5 flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <History className="h-3 w-3 text-emerald-400" />
                  <span className="text-[9px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest">
                    Chat history
                  </span>
                </div>
                <button
                  onClick={handleCreateSession}
                  className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                >
                  + New chat
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                <AnimatePresence mode="popLayout">
                  {sessionsLoading ? (
                    [1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-10 w-full rounded-xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 animate-pulse"
                      />
                    ))
                  ) : chatSessions.length === 0 ? (
                    <div className="text-[10px] font-bold text-slate-500 dark:text-white/20 uppercase tracking-widest text-center py-2">
                      No chats yet
                    </div>
                  ) : (
                    chatSessions.map((session, idx) => (
                      <motion.button
                        key={session._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => handleSelectSession(session._id)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                          selectedSessionId === session._id
                            ? "border-blue-500/50 bg-blue-500/10 text-blue-400 shadow-[inset_0_0_15px_rgba(59,130,246,0.1)]"
                            : "border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-white/[0.02] text-slate-500 dark:text-white/40 hover:border-slate-300 dark:hover:border-white/10 hover:bg-slate-200 dark:hover:bg-white/[0.04] hover:text-slate-700 dark:hover:text-white/60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate">{session.title}</span>
                          <span className="text-[8px] opacity-30 shrink-0">
                            {new Date(session.updatedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </motion.button>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-6 py-4">
            <button
              onClick={() => setShowSources(true)}
              className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-white/20 hover:bg-slate-200 dark:hover:bg-white/10 transition-all group"
              aria-label="Expand sources"
            >
              <PanelRightOpen className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </button>
            <div className="w-px h-12 bg-gradient-to-b from-white/10 to-transparent" />
            <div className="flex flex-col items-center gap-4">
              {projectFiles.slice(0, 5).map((file) => (
                <motion.div
                  key={file.file_id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-[8px] font-black text-red-400 cursor-help"
                  title={file.filename}
                >
                  PDF
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </aside>

      <aside
        className={`${
          activeTab === "tools" ? "" : "hidden lg:flex"
        } glass-cosmos rounded-[2rem] p-4 lg:p-6 flex flex-col gap-6 h-full flex-1 transition-all duration-500 border-slate-200 dark:border-white/5 relative overflow-hidden group/tools lg:order-1`}
      >
        {showTools ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Workflow className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] block">
                    Study tools
                  </span>
                  <span className="text-[8px] font-black text-blue-400/50 uppercase tracking-[0.1em]">
                    Practice options
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowTools(false)}
                className="hidden lg:flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-white/20 transition-all"
                aria-label="Collapse tools"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <motion.div
                whileHover={{ y: -2 }}
                className="group/module rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/80 dark:bg-white/[0.02] p-4 transition-all hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:border-amber-500/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover/module:bg-amber-500/20 transition-all">
                      <Shuffle className="h-4 w-4 text-amber-400" />
                    </div>
                    <span className="text-[10px] font-black text-slate-800 dark:text-white/80 uppercase tracking-widest">
                      Flashcards
                    </span>
                  </div>
                  <button
                    onClick={handleGenFlashcards}
                    className="text-[9px] px-3 py-1.5 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 font-black uppercase tracking-widest hover:bg-blue-600/20 hover:border-blue-500/40 transition-all disabled:opacity-50"
                    disabled={generatingTool}
                  >
                    {flashcards.length > 0 ? "Reset" : "Init"}
                  </button>
                </div>
                {flashcards.length > 0 ? (
                  <button
                    onClick={() => setToolView("flashcards")}
                    className="w-full mt-1 text-left flex items-center justify-between group/link"
                  >
                    <span className="text-[9px] font-bold text-slate-500 dark:text-white/30 uppercase tracking-widest group-hover/link:text-slate-800 dark:group-hover/link:text-white/60 transition-colors">
                      {flashcards.length} cards ready
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-400 dark:text-white/20 group-hover/link:text-blue-400 transition-colors" />
                  </button>
                ) : (
                  <p className="text-[8px] font-bold text-slate-500 dark:text-white/20 uppercase tracking-widest leading-relaxed">
                    Create cards to start
                    <br />
                    flashcard practice
                  </p>
                )}
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                className="group/module rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/80 dark:bg-white/[0.02] p-4 transition-all hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:border-emerald-500/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover/module:bg-emerald-500/20 transition-all">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                    </div>
                    <span className="text-[10px] font-black text-slate-800 dark:text-white/80 uppercase tracking-widest">
                      Quiz
                    </span>
                  </div>
                  <button
                    onClick={handleGenQuiz}
                    className="text-[9px] px-3 py-1.5 rounded-lg bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 font-black uppercase tracking-widest hover:bg-emerald-600/20 hover:border-emerald-500/40 transition-all disabled:opacity-50"
                    disabled={generatingTool}
                  >
                    {quizQuestions.length > 0 ? "Reset" : "Init"}
                  </button>
                </div>
                {quizQuestions.length > 0 ? (
                  <button
                    onClick={() => setToolView("quiz")}
                    className="w-full mt-1 text-left flex items-center justify-between group/link"
                  >
                    <span className="text-[9px] font-bold text-slate-500 dark:text-white/30 uppercase tracking-widest group-hover/link:text-slate-800 dark:group-hover/link:text-white/60 transition-colors">
                      {quizQuestions.length} questions ready
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-400 dark:text-white/20 group-hover/link:text-emerald-400 transition-colors" />
                  </button>
                ) : (
                  <p className="text-[8px] font-bold text-slate-500 dark:text-white/20 uppercase tracking-widest leading-relaxed">
                    Create quiz questions
                    <br />
                    to test understanding
                  </p>
                )}
              </motion.div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="h-3 w-3 text-blue-400" />
                <span className="text-[9px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest">
                  Status
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                  <span className="text-[8px] font-black text-slate-500 dark:text-white/20 uppercase tracking-widest block mb-1">
                    Cards
                  </span>
                  <span className="text-[10px] font-black text-blue-500 dark:text-blue-400">
                    {flashcards.length}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                  <span className="text-[8px] font-black text-slate-500 dark:text-white/20 uppercase tracking-widest block mb-1">
                    Quiz
                  </span>
                  <span className="text-[10px] font-black text-emerald-500 dark:text-emerald-400">
                    {quizQuestions.length}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-6 py-4">
            <button
              onClick={() => setShowTools(true)}
              className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-white/20 hover:bg-slate-200 dark:hover:bg-white/10 transition-all group"
              aria-label="Expand tools"
            >
              <PanelLeftOpen className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </button>
            <div className="w-px h-12 bg-gradient-to-b from-white/10 to-transparent" />
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[8px] font-black text-amber-400 cursor-help"
                title="Flashcards"
              >
                FC
              </div>
              <div
                className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[8px] font-black text-emerald-400 cursor-help"
                title="Quiz"
              >
                QZ
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default ProjectSidePanels;
