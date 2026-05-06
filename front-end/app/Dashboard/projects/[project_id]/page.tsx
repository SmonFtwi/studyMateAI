"use client";
import React, { useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  MessageCircle,
  File,
  Sparkles,
  Shuffle,
  Send,
  PanelLeftOpen,
  PanelLeftClose,
  PanelRightOpen,
  PanelRightClose,
  ChevronLeft,
  Database,
  Terminal,
  Cpu,
  Brain,
  History,
  Workflow,
  ExternalLink,
  Search,
  Zap,
  ArrowLeft,
  ShieldCheck,
  ChevronRight,
  FileWarning,
  Orbit,
} from "lucide-react";
import {
  uploadProjectSources,
  getProjectFiles,
  createChatSession,
  getChatSessions,
  getChatMessages,
  sendChatMessage,
  generateFlashcards,
  getFlashcards,
  generateQuiz,
  getQuiz,
} from "@/lib/apicall/project";
import { motion, AnimatePresence } from "framer-motion";

const ProjectPage: React.FC<{ params: { project_id: string } }> = ({
  params,
}) => {
  const project_id = params.project_id;
  const [isDesktop, setIsDesktop] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [projectFiles, setProjectFiles] = useState<
    { file_id: string; filename: string }[]
  >([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string; sources?: any[] }[]
  >([]);
  const [chatSessions, setChatSessions] = useState<
    { _id: string; title: string; updatedAt: string }[]
  >([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [chatLoading, setChatLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [showSources, setShowSources] = useState(true);
  const [showTools, setShowTools] = useState(true);
  const [activeTab, setActiveTab] = useState<"sources" | "chat" | "tools">(
    "chat"
  );
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [toolView, setToolView] = useState<"none" | "flashcards" | "quiz">("none");
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [generatingTool, setGeneratingTool] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [sources, setSources] = useState<any[]>([]);

  const gridTemplateLg = React.useMemo(() => {
    const src = showSources ? "260px" : "72px";
    const tools = showTools ? "280px" : "72px";
    return `${src} 1fr ${tools}`;
  }, [showSources, showTools]);

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const listener = () => setIsDesktop(mq.matches);
    listener();
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  const addFiles = (files: File[]) => {
    if (!files.length) return;
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setStatusMessage("Please select at least one file to upload.");
      setUploadStatus("error");
      return;
    }

    setUploading(true);
    setUploadStatus("idle");
    setStatusMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("You must be logged in to upload sources.");
      }

      await uploadProjectSources(token, project_id, selectedFiles);
      setUploadStatus("success");
      setStatusMessage(
        "Uploaded! Content is being embedded to your project’s vector store."
      );
      setSelectedFiles([]);
      setTimeout(() => setUploadStatus("idle"), 3500);
    } catch (error) {
      console.error("Upload failed", error);
      setUploadStatus("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Upload failed. Try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    addFiles(Array.from(e.target.files));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files?.length) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      setLoadingFiles(true);
      const res = await getProjectFiles(token, project_id);
      const list =
        res?.files?.map((f: any) => ({
          file_id: f.file_id || f._id,
          filename: f.filename,
        })) || [];
      setProjectFiles(list);
    } catch (err) {
      console.error("Failed to fetch project files", err);
    } finally {
      setLoadingFiles(false);
    }
  };

  React.useEffect(() => {
    fetchFiles();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      setSessionsLoading(true);
      const res = await getChatSessions(token, project_id);
      const list =
        res?.sessions?.map((s: any) => ({
          _id: s._id,
          title: s.title || "Chat",
          updatedAt: s.updatedAt,
        })) || [];
      setChatSessions(list);
      if (!selectedSessionId && list.length) {
        setSelectedSessionId(list[0]._id);
        fetchMessages(list[0]._id, token);
      }
    } catch (err) {
      console.error("Failed to fetch chat sessions", err);
    } finally {
      setSessionsLoading(false);
    }
  };

  const fetchMessages = async (sessionId: string, existingToken?: string) => {
    try {
      const token = existingToken || localStorage.getItem("token");
      if (!token) return;
      setChatLoading(true);
      const res = await getChatMessages(token, project_id, sessionId);
      const msgs =
        res?.messages?.map((m: any) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          text: m.content,
          sources: m.sources,
        })) || [];
      setMessages(msgs);
    } catch (err) {
      console.error("Failed to fetch chat messages", err);
    } finally {
      setChatLoading(false);
    }
  };

  const fetchFlashcards = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await getFlashcards(token, project_id);
      setFlashcards(res?.flashcards || []);
    } catch (err) {
      console.error("Failed to fetch flashcards", err);
    }
  };

  const fetchQuiz = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await getQuiz(token, project_id);
      setQuizQuestions(res?.questions || []);
    } catch (err) {
      console.error("Failed to fetch quiz", err);
    }
  };

  React.useEffect(() => {
    fetchSessions();
    fetchFlashcards();
    fetchQuiz();
  }, []);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Keyboard navigation for Flashcards and Quiz
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (toolView === "flashcards") {
        if (e.code === "Space" || e.code === "Enter") {
          e.preventDefault();
          setIsFlipped(prev => !prev);
        } else if (e.code === "ArrowRight" || e.code === "ArrowDown") {
          if (currentCardIndex < flashcards.length - 1) {
            setIsFlipped(false);
            setCurrentCardIndex(prev => prev + 1);
          }
        } else if (e.code === "ArrowLeft" || e.code === "ArrowUp") {
          if (currentCardIndex > 0) {
            setIsFlipped(false);
            setCurrentCardIndex(prev => prev - 1);
          }
        }
      } else if (toolView === "quiz") {
        if (!quizFinished && quizQuestions.length > 0) {
          if (e.code.startsWith("Digit")) {
            const digit = parseInt(e.code.replace("Digit", ""));
            if (digit >= 1 && digit <= quizQuestions[quizIndex].options.length) {
              if (selectedOption === null) {
                setSelectedOption(quizQuestions[quizIndex].options[digit - 1]);
              }
            }
          } else if (selectedOption !== null && (e.code === "Enter" || e.code === "ArrowRight")) {
            // Next question logic (mirrored from the button onClick)
            const isCorrect = selectedOption === quizQuestions[quizIndex].correctAnswer;
            if (quizIndex < quizQuestions.length - 1) {
              setQuizScore(prev => (prev || 0) + (isCorrect ? 1 : 0));
              setQuizIndex(prev => prev + 1);
              setSelectedOption(null);
            } else {
              setQuizScore(prev => {
                const finalScore = (prev || 0) + (isCorrect ? 1 : 0);
                setQuizScore(finalScore);
                setQuizFinished(true);
                return finalScore;
              });
            }
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    toolView, 
    currentCardIndex, 
    flashcards.length, 
    quizIndex, 
    quizQuestions, 
    selectedOption, 
    quizFinished
  ]);

  const handleCreateSession = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Login required");
      const res = await createChatSession(token, project_id, "New chat");
      const session = res?.session;
      if (session?._id) {
        setChatSessions((prev) => [session, ...prev]);
        setSelectedSessionId(session._id);
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to create chat session", err);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    fetchMessages(sessionId);
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Login required");

      let activeSession = selectedSessionId;
      if (!activeSession) {
        const created = await createChatSession(token, project_id, "New chat");
        activeSession = created?.session?._id || null;
        if (activeSession) {
          setChatSessions((prev) => [created.session, ...prev]);
          setSelectedSessionId(activeSession);
        }
      }
      if (!activeSession) throw new Error("Could not create chat session");

      setMessages((prev) => [...prev, { role: "user", text }]);
      setChatInput("");
      setIsTyping(true);

      const res = await sendChatMessage(token, project_id, activeSession, text);
      const assistantMsg = res?.message?.content;
      const assistantSources = res?.sources;
      setIsTyping(false);
      if (assistantMsg) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: assistantMsg, sources: assistantSources },
        ]);
      }
    } catch (err) {
      console.error("Failed to send chat message", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            "I ran into an issue fetching a response. Please try again in a moment.",
        },
      ]);
    }
  };

  const handleGenFlashcards = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Login required");
      setGeneratingTool(true);
      const res = await generateFlashcards(token, project_id);
      if (res?.flashcards) {
        setFlashcards(res.flashcards);
        setToolView("flashcards");
        setCurrentCardIndex(0);
        setIsFlipped(false);
      }
    } catch (err) {
      console.error("Failed to generate flashcards", err);
      alert(err instanceof Error ? err.message : "Failed to generate flashcards");
    } finally {
      setGeneratingTool(false);
    }
  };

  const handleGenQuiz = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Login required");
      setToolView("quiz");
      setGeneratingTool(true);
      setQuizFinished(false);
      setQuizIndex(0);
      setQuizScore(null);
      setSelectedOption(null);
      const res = await generateQuiz(token, project_id);
      if (res?.questions) {
        setQuizQuestions(res.questions);
      }
    } catch (err) {
      console.error("Failed to generate quiz", err);
      alert(err instanceof Error ? err.message : "Failed to generate quiz");
    } finally {
      setGeneratingTool(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Mobile tabs - Redesigned */}
      <div className="flex lg:hidden items-center justify-around border-b border-white/10 mb-4 bg-white/5 backdrop-blur-md rounded-2xl p-1">
        {["sources", "chat", "tools"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl ${
              activeTab === tab
                ? "bg-purple-500/20 text-purple-400 shadow-[inset_0_0_20px_rgba(168,85,247,0.2)]"
                : "text-white/30 hover:text-white/50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div
        className="flex flex-col lg:grid gap-6 flex-1 items-stretch pb-4"
        style={isDesktop ? { gridTemplateColumns: gridTemplateLg } : undefined}
      >
        {/* Sources - Redesigned */}
        <aside
          className={`${
            activeTab === "sources" ? "" : "hidden lg:flex"
          } glass-cosmos rounded-[2rem] p-4 lg:p-6 flex flex-col gap-6 h-full flex-1 transition-all duration-500 border-white/5 relative overflow-hidden group/aside`}
        >
          {showSources ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Database className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] block">
                      Archive_Sources
                    </span>
                    <span className="text-[8px] font-black text-blue-400/50 uppercase tracking-[0.1em]">
                      {loadingFiles ? "Scanning..." : `${projectFiles.length} Modules Linked`}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowSources(false)}
                  className="hidden lg:flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all"
                  aria-label="Collapse sources"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              </div>

              {/* Data Ingestion Portal (Upload Area) */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative rounded-2xl border border-dashed transition-all duration-300 group/upload ${
                  isDragging
                    ? "border-purple-500 bg-purple-500/5 shadow-[0_0_20px_rgba(168,85,247,0.1)]"
                    : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20"
                }`}
              >
                <div className="p-6 flex flex-col items-center justify-center text-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isDragging ? 'bg-purple-500 text-white scale-110' : 'bg-white/5 text-white/30'}`}>
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Data Ingestion</p>
                    <label className="text-[9px] font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer flex items-center gap-1 justify-center">
                      <Search className="w-3 h-3" />
                      BROWSE_SYSTEM_FILES
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
                {/* Decorative border beam effect when dragging */}
                {isDragging && <div className="absolute inset-0 border-beam rounded-2xl" />}
              </div>

              {/* Upload Queue */}
              <AnimatePresence>
                {selectedFiles.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                        Ingestion_Queue ({selectedFiles.length})
                      </span>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                      {selectedFiles.map((file, idx) => (
                        <motion.div
                          key={`${file.name}-${idx}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between text-[10px] font-bold text-white/80 bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2.5"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            <span className="truncate">{file.name}</span>
                          </div>
                          <button
                            className="text-white/20 hover:text-red-400 transition-colors"
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
                          ? "bg-white/5 text-white/20 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02]"
                      }`}
                    >
                      {uploading ? "Linking_Materials..." : "Execute_Ingestion"}
                    </button>
                    {statusMessage && (
                      <p className={`text-[9px] font-bold uppercase tracking-widest text-center ${uploadStatus === "error" ? "text-red-400" : "text-emerald-400"}`}>
                        {statusMessage}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* File List */}
              <div className="flex-1 overflow-hidden flex flex-col gap-3">
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest px-1">Linked_Modules</span>
                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                  <AnimatePresence mode="popLayout">
                    {loadingFiles ? (
                      [1, 2, 3].map((i) => (
                        <div key={i} className="h-12 w-full rounded-xl bg-white/[0.02] border border-white/5 animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                        </div>
                      ))
                    ) : projectFiles.length === 0 ? (
                      <div className="py-8 text-center">
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-loose">
                          No Materials Detected<br />Initiate Ingestion Sequence
                        </p>
                      </div>
                    ) : (
                      projectFiles.map((file, idx) => (
                        <motion.div
                          key={file.file_id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] font-bold text-white/70 hover:bg-white/[0.05] hover:border-white/10 hover:text-white transition-all cursor-default group/file"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center group-hover/file:bg-red-500/20 transition-all">
                            <FileText className="h-4 w-4 text-red-400" />
                          </div>
                          <span className="truncate flex-1">{file.filename}</span>
                          <div className="text-[8px] font-black text-white/10 uppercase group-hover/file:text-white/30 transition-colors">
                            DAT_{file.file_id.slice(-4).toUpperCase()}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Chat Sessions */}
              <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <History className="h-3 w-3 text-emerald-400" />
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                      Cognitive_Logs
                    </span>
                  </div>
                  <button
                    onClick={handleCreateSession}
                    className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  >
                    + NEW_LOG
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                  <AnimatePresence mode="popLayout">
                    {sessionsLoading ? (
                      [1, 2].map((i) => (
                        <div key={i} className="h-10 w-full rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />
                      ))
                    ) : chatSessions.length === 0 ? (
                      <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest text-center py-2">
                        Empty Logs
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
                              ? "border-purple-500/50 bg-purple-500/10 text-purple-400 shadow-[inset_0_0_15px_rgba(168,85,247,0.1)]"
                              : "border-white/5 bg-white/[0.02] text-white/40 hover:border-white/10 hover:bg-white/[0.04] hover:text-white/60"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate">{session.title}</span>
                            <span className="text-[8px] opacity-30 shrink-0">
                              {new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all group"
                aria-label="Expand sources"
              >
                <PanelLeftOpen className="h-5 w-5 group-hover:scale-110 transition-transform" />
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

        {/* Chat / main */}
        <main
          className={`glass-cosmos rounded-[2rem] p-4 lg:p-6 flex flex-col gap-4 h-full flex-1 transition-all duration-500 border-white/5 relative overflow-hidden group/main ${
            activeTab === "chat" ? "" : "hidden lg:flex"
          }`}
        >
          {/* Decorative scanline for the entire main area */}
          <div className="absolute inset-0 pointer-events-none bg-scanline opacity-[0.03] z-10" />
          
          {toolView === "none" ? (
            <>
              <div className="flex items-center justify-between z-20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Brain className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] block">
                      Neural_Interface
                    </span>
                    <span className="text-[8px] font-black text-emerald-400/50 uppercase tracking-[0.1em]">
                      {selectedSessionId ? `Linked_Session: ${selectedSessionId.slice(-6).toUpperCase()}` : "Awaiting_Input_Sequence"}
                    </span>
                  </div>
                </div>
                
                {selectedSessionId && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">System_Online</span>
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
                          <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 animate-pulse shrink-0" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 w-full rounded-lg bg-white/5 border border-white/10 overflow-hidden relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                            </div>
                            <div className="h-4 w-2/3 rounded-lg bg-white/5 border border-white/10 overflow-hidden relative">
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
                        <p className="text-sm font-black text-white uppercase tracking-[0.3em]">
                          Cognitive_Engine_Ready
                        </p>
                        <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest max-w-xs leading-relaxed">
                          Query the knowledge base or initiate a practice sequence via the modules on the right.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {!chatLoading &&
                    messages.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10, x: msg.role === "user" ? 10 : -10 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-5 py-4 text-[13px] leading-relaxed relative group/msg ${
                            msg.role === "user"
                              ? "bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 text-white shadow-[0_0_20px_rgba(59,130,246,0.1)] rounded-tr-none"
                              : "bg-white/[0.03] border border-white/10 text-white/90 rounded-tl-none shadow-[0_0_20px_rgba(255,255,255,0.02)]"
                          }`}
                        >
                          {/* Scanline for assistant messages */}
                          {msg.role === "assistant" && (
                            <div className="absolute inset-0 pointer-events-none bg-scanline opacity-[0.02] rounded-2xl overflow-hidden" />
                          )}
                          
                          <div className="relative z-10">
                            {msg.text}
                            
                            {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                              <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                                <span className="text-[9px] uppercase tracking-[0.2em] font-black text-white/30 block w-full mb-1">Source_Nodes</span>
                                {msg.sources.map((src, sIdx) => (
                                  <div key={sIdx} className="group/src relative">
                                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[9px] font-black border border-blue-500/20 transition-all hover:bg-blue-500/20 hover:border-blue-500/40 cursor-help uppercase tracking-widest">
                                      {src.label}
                                    </span>
                                    {/* Cosmic Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-4 glass-cosmos border border-white/10 text-white text-[10px] rounded-2xl opacity-0 group-hover/src:opacity-100 pointer-events-none transition-all duration-300 z-50 shadow-2xl scale-95 group-hover/src:scale-100 backdrop-blur-xl">
                                      <p className="font-black border-b border-white/10 pb-2 mb-2 truncate text-blue-400 uppercase tracking-widest">
                                        {src.metadata?.filename || "Module_Fragment"}
                                      </p>
                                      <p className="line-clamp-4 italic text-white/60 leading-relaxed font-medium">
                                        "{src.metadata?.chunk?.slice(0, 150)}..."
                                      </p>
                                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white/10" />
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
                      <div className="bg-white/[0.03] border border-white/10 rounded-2xl rounded-tl-none px-5 py-4 flex gap-2 items-center">
                        <div className="flex gap-1.5 items-center">
                          <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                            className="w-1.5 h-1.5 bg-emerald-400 rounded-full" 
                          />
                          <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                            className="w-1.5 h-1.5 bg-emerald-400 rounded-full" 
                          />
                          <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                            className="w-1.5 h-1.5 bg-emerald-400 rounded-full" 
                          />
                        </div>
                        <span className="text-[9px] font-black text-emerald-400/50 uppercase tracking-widest ml-1">Synthesizing_Response</span>
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
                    className="flex-1 rounded-2xl bg-white/[0.02] border border-white/10 pl-12 pr-14 py-4 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                    placeholder="Enter command or query..."
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
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                  <div>
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] block">
                      Active_Recall
                    </span>
                    <span className="text-[8px] font-black text-amber-400/50 uppercase tracking-[0.1em]">
                      Sequence_ID: {project_id?.toString().slice(-6).toUpperCase()}
                    </span>
                  </div>
                </div>
                {!generatingTool && flashcards.length > 0 && (
                  <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Progress</span>
                    <span className="text-[10px] font-black text-amber-400 tracking-widest">{currentCardIndex + 1}/{flashcards.length}</span>
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
                    <p className="text-[11px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Compiling_Neural_Units</p>
                    <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Structuring_Active_Recall_Nodes...</p>
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
                        duration: 0.6 
                      }}
                      onClick={() => setIsFlipped(!isFlipped)}
                    >
                      {/* Front */}
                      <div className="absolute inset-0 backface-hidden glass-cosmos border border-white/10 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center shadow-2xl overflow-hidden group-hover:border-amber-500/30 transition-colors">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        
                        <div className="absolute top-10 left-10 w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                          <Zap className="w-6 h-6 text-amber-400" />
                        </div>
                        
                        <div className="space-y-6">
                          <span className="text-[12px] font-black text-amber-400/30 uppercase tracking-[0.4em] block">Query_Fragment</span>
                          <h3 className="text-3xl font-black text-white leading-tight tracking-tight max-w-lg">
                            {flashcards[currentCardIndex].question}
                          </h3>
                        </div>

                        <div className="absolute bottom-10 flex flex-col items-center gap-2">
                          <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] animate-pulse">Click_To_Decrypt_Response</span>
                          <div className="flex gap-1">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className="w-1 h-1 rounded-full bg-white/10" />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Back */}
                      <div className="absolute inset-0 backface-hidden glass-cosmos border border-emerald-500/30 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center shadow-2xl rotate-y-180 bg-emerald-500/[0.03] overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                        
                        <div className="absolute top-10 left-10 w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                          <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        </div>

                        <div className="space-y-6">
                          <span className="text-[12px] font-black text-emerald-400/30 uppercase tracking-[0.4em] block">Resolved_Node</span>
                          <div className="relative">
                            <div className="absolute -inset-4 bg-emerald-500/5 blur-2xl rounded-full" />
                            <p className="relative text-2xl font-bold text-white/90 leading-relaxed italic tracking-tight max-w-lg">
                              {flashcards[currentCardIndex].answer}
                            </p>
                          </div>
                        </div>

                        <div className="absolute bottom-10 flex flex-col items-center gap-2">
                          <span className="text-[8px] font-black text-emerald-400/20 uppercase tracking-[0.3em]">Validation_Complete</span>
                          <div className="flex gap-1">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className="w-4 h-0.5 rounded-full bg-emerald-500/20" />
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
                      className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-10 active:scale-95 flex items-center gap-2 group/btn"
                    >
                      <ChevronLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
                      Prev_Unit
                    </button>

                    <div className="flex gap-2">
                      {flashcards.slice(Math.max(0, currentCardIndex - 2), Math.min(flashcards.length, currentCardIndex + 3)).map((_, i) => {
                        const actualIdx = i + Math.max(0, currentCardIndex - 2);
                        return (
                          <div 
                            key={actualIdx}
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              actualIdx === currentCardIndex ? "w-8 bg-amber-400" : "w-1.5 bg-white/10"
                            }`}
                          />
                        );
                      })}
                    </div>

                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentCardIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : prev));
                      }}
                      disabled={currentCardIndex === flashcards.length - 1}
                      className="px-8 py-4 rounded-2xl bg-blue-600 text-[10px] font-black text-white uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-10 active:scale-95 flex items-center gap-2 group/btn"
                    >
                      Next_Unit
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <FileWarning className="w-8 h-8 text-white/20" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">No_Units_Detected</p>
                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Initiate sequence from Cognitive_Modules</p>
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
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                  <div>
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] block">
                      Validation_Protocol
                    </span>
                    <span className="text-[8px] font-black text-emerald-400/50 uppercase tracking-[0.1em]">
                      Sequence_ID: {project_id?.toString().slice(-6).toUpperCase()}
                    </span>
                  </div>
                </div>
                {!quizFinished && quizQuestions.length > 0 && (
                  <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Query</span>
                    <span className="text-[10px] font-black text-emerald-400 tracking-widest">{quizIndex + 1}/{quizQuestions.length}</span>
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
                    <p className="text-[11px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Initializing_Validation_Sequence</p>
                    <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Compiling_Knowledge_Nodes...</p>
                  </div>
                </div>
              ) : quizFinished ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-10 animate-in zoom-in-95 duration-700">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500 blur-[100px] opacity-20 animate-pulse" />
                    <div className="relative h-48 w-48 rounded-full border border-white/10 flex flex-col items-center justify-center bg-white/[0.02] backdrop-blur-3xl shadow-2xl">
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
                          initial={{ strokeDasharray: "552.92", strokeDashoffset: "552.92" }}
                          animate={{ strokeDashoffset: 552.92 * (1 - (quizScore || 0) / quizQuestions.length) }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                        />
                        <defs>
                          <linearGradient id="emerald-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#3b82f6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Stability</span>
                        <span className="text-5xl font-black text-white tracking-tighter">
                          {Math.round(((quizScore || 0) / quizQuestions.length) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center space-y-3">
                    <h3 className="text-xl font-black text-white uppercase tracking-[0.2em]">Sequence_Validated</h3>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.1em]">
                      Success_Rate: <span className="text-emerald-400">{quizScore}</span> / {quizQuestions.length} Query_Nodes
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
                      className="flex-1 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
                    >
                      Retry_Sequence
                    </button>
                    <button
                      onClick={() => setToolView("none")}
                      className="flex-1 px-6 py-4 rounded-2xl bg-blue-600 text-[10px] font-black text-white uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                    >
                      Return_To_Root
                    </button>
                  </div>
                </div>
              ) : quizQuestions.length > 0 ? (
                <div className="flex-1 flex flex-col space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="space-y-6">
                    <div className="glass-cosmos rounded-[2.5rem] p-10 border border-white/10 relative overflow-hidden group/quiz">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <div className="absolute top-8 left-8 w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Terminal className="w-5 h-5 text-blue-400" />
                      </div>
                      <p className="text-xl font-black text-white leading-relaxed tracking-tight pl-12">
                        {quizQuestions[quizIndex].question}
                      </p>
                    </div>
                    
                    <div className="grid gap-4">
                      {quizQuestions[quizIndex].options.map((opt: string, optIdx: number) => {
                        const isSelected = selectedOption === opt;
                        const isCorrect = opt === quizQuestions[quizIndex].correctAnswer;
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
                                  : "bg-white/[0.02] border-white/10 text-white/60 hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-[10px] font-black opacity-20 uppercase tracking-widest">0{optIdx + 1}</span>
                              <span className="font-bold tracking-tight">{opt}</span>
                            </div>
                            {showResult && isCorrect && (
                              <CheckCircle className="h-5 w-5 text-emerald-400 animate-in zoom-in duration-300" />
                            )}
                            {showResult && isSelected && !isCorrect && (
                              <X className="h-5 w-5 text-red-400 animate-in zoom-in duration-300" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-6 mt-auto">
                    <button 
                      onClick={() => {
                        setQuizIndex(0);
                        setQuizScore(null);
                        setSelectedOption(null);
                      }}
                      className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] hover:text-white/40 transition-colors"
                    >
                      Reboot_Sequence
                    </button>
                    {selectedOption && (
                      <button
                        onClick={() => {
                          const isCorrect = selectedOption === quizQuestions[quizIndex].correctAnswer;
                          
                          if (quizIndex < quizQuestions.length - 1) {
                            setQuizScore(prev => (prev || 0) + (isCorrect ? 1 : 0));
                            setQuizIndex(prev => prev + 1);
                            setSelectedOption(null);
                          } else {
                            setQuizScore(prev => {
                                const finalScore = (prev || 0) + (isCorrect ? 1 : 0);
                                setQuizScore(finalScore);
                                setQuizFinished(true);
                                return finalScore;
                            });
                          }
                        }}
                        className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 group"
                      >
                        {quizIndex === quizQuestions.length - 1 ? "Resolve_Results" : "Next_Fragment"}
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <FileWarning className="w-8 h-8 text-white/20" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">No_Queries_Detected</p>
                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Initiate sequence from Cognitive_Modules</p>
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
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { repeat: Infinity, duration: 20, ease: "linear" },
                      scale: { repeat: Infinity, duration: 4, ease: "easeInOut" }
                    }}
                    className="relative w-full h-full border border-white/10 rounded-full flex items-center justify-center backdrop-blur-sm"
                  >
                    <Orbit className="w-12 h-12 text-blue-400" />
                  </motion.div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-[0.3em]">Module_Idle</h3>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-relaxed">
                    Select a neural enhancement module<br />from the sidebar to proceed
                  </p>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* Tools */}
        <aside
          className={`${
            activeTab === "tools" ? "" : "hidden lg:flex"
          } glass-cosmos rounded-[2rem] p-4 lg:p-6 flex flex-col gap-6 h-full flex-1 transition-all duration-500 border-white/5 relative overflow-hidden group/tools`}
        >
          {showTools ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Workflow className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] block">
                      Cognitive_Modules
                    </span>
                    <span className="text-[8px] font-black text-purple-400/50 uppercase tracking-[0.1em]">
                      Enhancement_Suites
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowTools(false)}
                  className="hidden lg:flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all"
                  aria-label="Collapse tools"
                >
                  <PanelRightClose className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <motion.div 
                  whileHover={{ y: -2 }}
                  className="group/module rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:bg-white/[0.05] hover:border-amber-500/30"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover/module:bg-amber-500/20 transition-all">
                        <Shuffle className="h-4 w-4 text-amber-400" />
                      </div>
                      <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">Flashcards</span>
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
                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest group-hover/link:text-white/60 transition-colors">
                        {flashcards.length} Units_Available
                      </span>
                      <ExternalLink className="w-3 h-3 text-white/20 group-hover/link:text-blue-400 transition-colors" />
                    </button>
                  ) : (
                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest leading-relaxed">
                      Generate units to begin<br />Active_Recall sequence
                    </p>
                  )}
                </motion.div>

                <motion.div 
                  whileHover={{ y: -2 }}
                  className="group/module rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:bg-white/[0.05] hover:border-emerald-500/30"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover/module:bg-emerald-500/20 transition-all">
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                      </div>
                      <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">Validation_Quiz</span>
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
                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest group-hover/link:text-white/60 transition-colors">
                        {quizQuestions.length} Queries_Detected
                      </span>
                      <ExternalLink className="w-3 h-3 text-white/20 group-hover/link:text-emerald-400 transition-colors" />
                    </button>
                  ) : (
                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest leading-relaxed">
                      Initiate validation sequence<br />to test comprehension
                    </p>
                  )}
                </motion.div>
              </div>

              {/* Status Board */}
              <div className="mt-auto pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <Cpu className="h-3 w-3 text-blue-400" />
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">System_Vitals</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-1">Cores</span>
                    <span className="text-[10px] font-black text-blue-400">08_ACTIVE</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-1">Load</span>
                    <span className="text-[10px] font-black text-emerald-400">LOW_LATENCY</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-6 py-4">
              <button
                onClick={() => setShowTools(true)}
                className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all group"
                aria-label="Expand tools"
              >
                <PanelRightOpen className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </button>
              <div className="w-px h-12 bg-gradient-to-b from-white/10 to-transparent" />
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[8px] font-black text-amber-400 cursor-help" title="Flashcards">FC</div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[8px] font-black text-emerald-400 cursor-help" title="Quiz">QZ</div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default ProjectPage;
