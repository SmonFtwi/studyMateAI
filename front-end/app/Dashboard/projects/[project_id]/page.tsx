"use client";
import React, { useState } from "react";
import ProjectSidePanels from "@/components/dashboardComponent/projectComponent/ProjectSidePanels";
import ProjectWorkspace from "@/components/dashboardComponent/projectComponent/ProjectWorkspace";
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

  const gridTemplateLg = React.useMemo(() => {
    const src = showSources ? "260px" : "72px";
    const tools = showTools ? "280px" : "72px";
    return `${tools} 1fr ${src}`;
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
    <div className="h-full min-h-[calc(100vh-7rem)] flex flex-col">
      <div className="flex lg:hidden items-center justify-around border-b border-white/10 mb-4 bg-white/5 backdrop-blur-md rounded-2xl p-1">
        {(["tools", "chat", "sources"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl ${
              activeTab === tab
                ? "bg-blue-500/20 text-blue-400 shadow-[inset_0_0_20px_rgba(59,130,246,0.2)]"
                : "text-slate-500 dark:text-white/30 hover:text-slate-700 dark:hover:text-white/50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div
        className="flex flex-col lg:grid gap-6 flex-1 min-h-0 items-stretch"
        style={isDesktop ? { gridTemplateColumns: gridTemplateLg } : undefined}
      >
        <ProjectSidePanels
          activeTab={activeTab}
          showSources={showSources}
          setShowSources={setShowSources}
          showTools={showTools}
          setShowTools={setShowTools}
          loadingFiles={loadingFiles}
          projectFiles={projectFiles}
          isDragging={isDragging}
          selectedFiles={selectedFiles}
          uploading={uploading}
          uploadStatus={uploadStatus}
          statusMessage={statusMessage}
          sessionsLoading={sessionsLoading}
          chatSessions={chatSessions}
          selectedSessionId={selectedSessionId}
          generatingTool={generatingTool}
          flashcards={flashcards}
          quizQuestions={quizQuestions}
          setToolView={setToolView}
          handleDrop={handleDrop}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleFileInput={handleFileInput}
          removeFile={removeFile}
          handleUpload={handleUpload}
          handleCreateSession={handleCreateSession}
          handleSelectSession={handleSelectSession}
          handleGenFlashcards={handleGenFlashcards}
          handleGenQuiz={handleGenQuiz}
        />
        <ProjectWorkspace
          activeTab={activeTab}
          toolView={toolView}
          selectedSessionId={selectedSessionId}
          chatLoading={chatLoading}
          messages={messages}
          isTyping={isTyping}
          scrollRef={scrollRef}
          chatInput={chatInput}
          setChatInput={setChatInput}
          handleSendMessage={handleSendMessage}
          generatingTool={generatingTool}
          flashcards={flashcards}
          currentCardIndex={currentCardIndex}
          setCurrentCardIndex={setCurrentCardIndex}
          isFlipped={isFlipped}
          setIsFlipped={setIsFlipped}
          projectId={project_id}
          setToolView={setToolView}
          quizQuestions={quizQuestions}
          quizIndex={quizIndex}
          setQuizIndex={setQuizIndex}
          quizScore={quizScore}
          setQuizScore={setQuizScore}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          quizFinished={quizFinished}
          setQuizFinished={setQuizFinished}
        />
      </div>
    </div>
  );
};

export default ProjectPage;
