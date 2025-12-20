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
} from "lucide-react";
import { uploadProjectSources, getProjectFiles } from "@/lib/apicall/project";

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
    { role: "user" | "assistant"; text: string }[]
  >([]);
  const [showSources, setShowSources] = useState(true);
  const [showTools, setShowTools] = useState(true);
  const [activeTab, setActiveTab] = useState<"sources" | "chat" | "tools">(
    "chat"
  );

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

  return (
    <div className="min-h-[90vh] bg-slate-50 text-gray-900 dark:bg-slate-950 dark:text-gray-100 p-4 md:p-6 flex flex-col transition-colors">
      {/* Mobile tabs */}
      <div className="flex lg:hidden items-center justify-around border-b border-slate-200 dark:border-slate-800 mb-4 text-sm font-semibold">
        {["sources", "chat", "tools"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`relative px-3 py-2 capitalize ${
              activeTab === tab
                ? "text-blue-600 dark:text-blue-300"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute left-0 right-0 -bottom-[6px] h-0.5 bg-blue-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div
        className="flex flex-col lg:grid gap-4 flex-1 items-stretch"
        style={isDesktop ? { gridTemplateColumns: gridTemplateLg } : undefined}
      >
        {/* Sources */}
        <aside
          className={`${
            activeTab === "sources" ? "" : "hidden lg:flex"
          } bg-white/85 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 lg:p-4 flex flex-col gap-4 h-full flex-1 shadow-sm dark:shadow-none transition-colors`}
        >
          {showSources ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Sources
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {loadingFiles ? "…" : projectFiles.length} files
                  </span>
                  <button
                    onClick={() => setShowSources(false)}
                    className="hidden lg:flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-500 transition"
                    aria-label="Collapse sources"
                  >
                    <PanelLeftClose className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`rounded-xl border-2 border-dashed ${
                  isDragging
                    ? "border-blue-500"
                    : "border-slate-300 dark:border-slate-700"
                } bg-slate-100/70 dark:bg-slate-900/70 p-3 text-xs text-slate-700 dark:text-gray-400 transition-colors`}
              >
                Drop files here or
                <label className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-500 dark:hover:text-blue-200 underline cursor-pointer">
                  browse
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={handleFileInput}
                    disabled={uploading}
                  />
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-3 space-y-2 transition-colors">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Queue ({selectedFiles.length})
                  </div>
                  <ul className="space-y-2">
                    {selectedFiles.map((file, idx) => (
                      <li
                        key={`${file.name}-${idx}`}
                        className="flex items-center justify-between text-sm text-slate-900 dark:text-gray-200 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 transition-colors"
                      >
                        <span className="truncate">{file.name}</span>
                        <button
                          className="text-gray-400 hover:text-red-400 transition-colors"
                          onClick={() => removeFile(idx)}
                          aria-label="Remove file"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition ${
                      uploading
                        ? "bg-slate-200 dark:bg-slate-800 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-500 text-white"
                    }`}
                  >
                    {uploading ? "Uploading..." : "Upload to project"}
                  </button>
                  {statusMessage && (
                    <p
                      className={`text-xs ${
                        uploadStatus === "error"
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                      {statusMessage}
                    </p>
                  )}
                </div>
              )}

              <div className="flex-1 overflow-y-auto space-y-2">
                {loadingFiles && (
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    Loading files…
                  </div>
                )}
                {!loadingFiles && projectFiles.length === 0 && (
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    No sources yet. Upload to get started.
                  </div>
                )}
                {projectFiles.map((file) => (
                  <div
                    key={file.file_id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-gray-200 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                    <span className="truncate">{file.filename}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-2">
              <button
                onClick={() => setShowSources(true)}
                className="h-10 w-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-200 hover:border-blue-400 dark:hover:border-blue-400 transition"
                aria-label="Expand sources"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.multiple = true;
                  input.onchange = (e: any) => {
                    const files = Array.from(e.target.files || []) as File[];
                    addFiles(files);
                  };
                  input.click();
                }}
                className="h-9 w-9 rounded-lg bg-slate-700 text-white flex items-center justify-center text-xl"
                aria-label="Add files"
              >
                +
              </button>
              <div className="flex flex-col items-center gap-3 mt-2">
                {projectFiles.slice(0, 4).map((file) => (
                  <div
                    key={file.file_id}
                    className="h-9 w-9 rounded-md bg-red-500/90 text-white flex items-center justify-center text-[10px] font-bold"
                    title={file.filename}
                  >
                    PDF
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Chat / main */}
        <main
          className={`bg-white/85 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-4 h-full flex-1 shadow-sm dark:shadow-none transition-colors ${
            activeTab === "chat" ? "" : "hidden lg:flex"
          }`}
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-emerald-500 dark:text-emerald-300" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Chat with your project
            </h2>
          </div>
          <div className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 flex flex-col gap-3 overflow-hidden transition-colors">
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {messages.length === 0 && (
                <p className="text-sm text-slate-700 dark:text-gray-500">
                  Ask anything about your uploaded sources.
                </p>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`max-w-3xl rounded-lg px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-blue-50 text-slate-900 ml-auto border border-blue-100 dark:bg-slate-800 dark:text-gray-100 dark:border-slate-700"
                      : "bg-slate-100 text-slate-900 border border-slate-200 dark:bg-slate-900 dark:text-gray-200 dark:border-slate-800"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const text = chatInput.trim();
                if (!text) return;
                setMessages((prev) => [
                  ...prev,
                  { role: "user", text },
                  {
                    role: "assistant",
                    text: "AI response coming soon. (Hook to your chat backend here.)",
                  },
                ]);
                setChatInput("");
              }}
            >
              <input
                className="flex-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="Type your question..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button
                type="submit"
                className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </main>

        {/* Tools */}
        <aside
          className={`${
            activeTab === "tools" ? "" : "hidden lg:flex"
          } bg-white/85 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 lg:p-4 flex flex-col gap-4 h-full flex-1 shadow-sm dark:shadow-none transition-colors`}
        >
          {showTools ? (
            <>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500 dark:text-purple-300" />
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Tools
                </span>
                <button
                  onClick={() => setShowTools(false)}
                  className="hidden lg:flex ml-auto h-8 w-8 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-500 transition"
                  aria-label="Collapse tools"
                >
                  <PanelRightClose className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-3 transition-colors text-slate-900 dark:text-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                      <Shuffle className="h-4 w-4 text-amber-500 dark:text-amber-300" />
                      Flashcards
                    </div>
                    <button className="text-xs text-blue-600 dark:text-blue-300 hover:text-blue-500 dark:hover:text-blue-200">
                      Generate
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-gray-500 mt-2">
                    Turn current sources into spaced-repetition cards.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-3 transition-colors text-slate-900 dark:text-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                      <MessageCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-300" />
                      Question generation
                    </div>
                    <button className="text-xs text-blue-600 dark:text-blue-300 hover:text-blue-500 dark:hover:text-blue-200">
                      Generate
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-gray-500 mt-2">
                    Build practice questions from your uploaded files.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-2">
              <button
                onClick={() => setShowTools(true)}
                className="h-10 w-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-200 hover:border-blue-400 dark:hover:border-blue-400 transition"
                aria-label="Expand tools"
              >
                <PanelRightOpen className="h-4 w-4" />
              </button>
              <div className="flex flex-col items-center gap-3 mt-2">
                <div className="h-9 w-9 rounded-md bg-amber-500/90 text-white flex items-center justify-center text-[10px] font-bold">
                  FC
                </div>
                <div className="h-9 w-9 rounded-md bg-emerald-500/90 text-white flex items-center justify-center text-[10px] font-bold">
                  Q?
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default ProjectPage;
