"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  Layers,
  MessageSquare,
  Plus,
  Send,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import * as api from "@/lib/apicall/project";
interface Source {
  label?: string;
  metadata?: { filename?: string; chunk?: string };
}
interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}
interface Session {
  _id: string;
  title: string;
}
interface StudyFile {
  file_id: string;
  filename: string;
}
interface Flashcard {
  question: string;
  answer: string;
}
interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}
type Tab = "chat" | "flashcards" | "quiz";
const token = () => localStorage.getItem("token") || "";
export default function ProjectPage({
  params,
}: {
  params: { project_id: string };
}) {
  return <StudyProject key={params.project_id} id={params.project_id} />;
}
function StudyProject({ id }: { id: string }) {
  const [title, setTitle] = useState("Study project");
  const [tab, setTab] = useState<Tab>("chat");
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [desktopSources, setDesktopSources] = useState(true);
  const [files, setFiles] = useState<StudyFile[]>([]);
  const [selected, setSelected] = useState<File[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [session, setSession] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dragging, setDragging] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const messageRequest = useRef(0);
  const actionLock = useRef(false);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const results = await Promise.allSettled([
      api.getProjects(token()),
      api.getProjectFiles(token(), id),
      api.getChatSessions(token(), id),
      api.getFlashcards(token(), id),
      api.getQuiz(token(), id),
    ]);
    const [p, f, s, c, q] = results;
    if (p.status === "fulfilled") {
      const project = p.value.projects?.find(
        (v: { project_id?: string; _id?: string }) =>
          (v.project_id || v._id) === id,
      );
      if (project) setTitle(project.title);
    }
    if (f.status === "fulfilled") setFiles(f.value.files || []);
    if (s.status === "fulfilled") setSessions(s.value.sessions || []);
    if (c.status === "fulfilled") {
      setCards(c.value.flashcards || []);
      setCardIndex(0);
      setFlipped(false);
    }
    if (q.status === "fulfilled") {
      setQuestions(q.value.questions || []);
      setQuizIndex(0);
      setAnswer(null);
      setScore(0);
      setFinished(false);
    }
    if (results.some((r) => r.status === "rejected"))
      setError(
        "Some study materials couldn’t be loaded. Try reloading your project.",
      );
    setLoading(false);
  }, [id]);
  useEffect(() => {
    void load();
    const requestTracker = messageRequest;
    return () => {
      requestTracker.current++;
    };
  }, [load]);
  useEffect(() => {
    const container = bottom.current?.parentElement;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages, busy]);
  async function run(kind: string, work: () => Promise<void>) {
    if (actionLock.current) return;
    actionLock.current = true;
    setBusy(kind);
    setError("");
    setNotice("");
    try {
      await work();
    } catch (e) {
      setError(
        e instanceof Error && e.message.length < 240
          ? e.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      actionLock.current = false;
      setBusy("");
    }
  }
  async function chooseSession(value: string) {
    if (busy) return;
    const request = ++messageRequest.current;
    setSession(value);
    setError("");
    setMessages([]);
    if (!value) {
      setChatLoading(false);
      return;
    }
    setChatLoading(true);
    try {
      const res = await api.getChatMessages(token(), id, value);
      if (request === messageRequest.current) setMessages(res.messages || []);
    } catch {
      if (request === messageRequest.current)
        setError(
          "This conversation couldn’t be loaded. Select it again to retry.",
        );
    } finally {
      if (request === messageRequest.current) setChatLoading(false);
    }
  }
  const upload = () =>
    run("upload", async () => {
      if (!selected.length) return;
      await api.uploadProjectSources(token(), id, selected);
      setSelected([]);
      setNotice(
        "Upload received. Your sources will appear here as they become available.",
      );
      const res = await api.getProjectFiles(token(), id);
      setFiles(res.files || []);
    });
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy || chatLoading) return;
    void run("chat", async () => {
      let current = session;
      if (!current) {
        const res = await api.createChatSession(token(), id, "New chat");
        current = res.session?._id;
        if (!current)
          throw new Error("Couldn’t start a conversation. Please try again.");
        setSessions((old) => [res.session, ...old]);
        setSession(current);
      }
      setInput("");
      setMessages((old) => [...old, { role: "user", content: text }]);
      try {
        const res = await api.sendChatMessage(token(), id, current, text);
        if (res.message?.content)
          setMessages((old) => [
            ...old,
            {
              role: "assistant",
              content: res.message.content,
              sources: res.sources || res.message.sources,
            },
          ]);
        else if (res.approval_id)
          setNotice(
            "Your question is waiting for review. You can return to this conversation later.",
          );
        else
          throw new Error(
            "No answer was returned. Please try your question again.",
          );
      } catch (e) {
        setInput(text);
        setMessages((old) => old.slice(0, -1));
        throw e;
      }
    });
  };
  const generate = (kind: "flashcards" | "quiz") =>
    run(kind, async () => {
      if (kind === "flashcards") {
        const res = await api.generateFlashcards(token(), id);
        setCards(res.flashcards || []);
        setCardIndex(0);
        setFlipped(false);
        if (!res.flashcards?.length)
          setNotice(
            "No flashcards were generated. Try adding more source material.",
          );
      } else {
        const res = await api.generateQuiz(token(), id);
        setQuestions(res.questions || []);
        restart();
        if (!res.questions?.length)
          setNotice(
            "No questions were generated. Try adding more source material.",
          );
      }
    });
  function restart() {
    setQuizIndex(0);
    setAnswer(null);
    setScore(0);
    setFinished(false);
  }
  function nextQuestion() {
    if (answer === null || finished) return;
    setScore((v) => v + Number(answer === questions[quizIndex]?.correctAnswer));
    if (quizIndex === questions.length - 1) setFinished(true);
    else {
      setQuizIndex((v) => v + 1);
      setAnswer(null);
    }
  }
  useEffect(() => {
    function key(e: KeyboardEvent) {
      const el = e.target as HTMLElement;
      if (
        el.closest(
          "input,textarea,select,button,a,[contenteditable=true],[role=dialog]",
        ) ||
        busy
      )
        return;
      if (tab === "flashcards" && cards.length) {
        if (e.code === "Space") {
          e.preventDefault();
          setFlipped((v) => !v);
        }
        if (e.code === "ArrowRight") {
          setCardIndex((v) => Math.min(v + 1, cards.length - 1));
          setFlipped(false);
        }
        if (e.code === "ArrowLeft") {
          setCardIndex((v) => Math.max(0, v - 1));
          setFlipped(false);
        }
      }
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [tab, cards.length, busy]);
  function addFiles(list: FileList | File[] | null) {
    if (!list) return;
    setSelected((old) => [
      ...old,
      ...Array.from(list).filter(
        (f) =>
          !old.some(
            (o) =>
              o.name === f.name &&
              o.size === f.size &&
              o.lastModified === f.lastModified,
          ),
      ),
    ]);
  }
  const sources = (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">
          Sources <span className="muted text-sm">{files.length}</span>
        </h2>
        <Button
          variant="ghost"
          size="sm"
          disabled={!!busy || loading}
          onClick={() =>
            void run("refresh", async () => {
              const res = await api.getProjectFiles(token(), id);
              setFiles(res.files || []);
            })
          }
        >
          Refresh
        </Button>
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!busy) addFiles(e.dataTransfer.files);
        }}
        className={`rounded-xl border border-dashed p-5 text-center ${dragging ? "border-blue-500 bg-blue-500/10" : ""}`}
      >
        <Upload size={22} className="mx-auto accent mb-3" />
        <p className="text-sm font-medium">Add study materials</p>
        <p className="muted mt-2 text-xs leading-5">
          Drop files here, or choose from your device.
        </p>
        <label className="mt-4 inline-flex cursor-pointer text-sm accent underline underline-offset-4 focus-within:outline focus-within:outline-2 focus-within:outline-blue-500 focus-within:outline-offset-4">
          Choose files
          <input
            type="file"
            multiple
            disabled={!!busy}
            aria-label="Choose source files"
            className="sr-only"
            accept=".pdf,.docx,.xlsx,.csv,.txt,.md"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        <p className="muted text-xs leading-5 mt-3">
          PDF, DOCX, XLSX, CSV, TXT, Markdown
        </p>
      </div>
      {selected.length > 0 && (
        <div className="space-y-2">
          {selected.map((f, i) => (
            <div
              key={`${f.name}-${i}`}
              className="flex items-center gap-2 text-xs"
            >
              <span className="truncate flex-1">{f.name}</span>
              <Button
                size="icon"
                variant="ghost"
                disabled={!!busy}
                aria-label={`Remove ${f.name}`}
                onClick={() =>
                  setSelected((old) => old.filter((_, n) => n !== i))
                }
              >
                <X size={14} />
              </Button>
            </div>
          ))}
          <Button className="w-full" disabled={!!busy} onClick={upload}>
            {busy === "upload"
              ? "Uploading…"
              : `Upload ${selected.length} file${selected.length === 1 ? "" : "s"}`}
          </Button>
        </div>
      )}
      <div className="space-y-3">
        {loading ? (
          <p className="muted text-sm">Loading sources…</p>
        ) : files.length ? (
          files.map((f, i) => (
            <div
              key={f.file_id || i}
              className="flex gap-3 rounded-lg border p-3"
            >
              <FileText size={17} className="accent shrink-0" />
              <span className="text-xs break-all leading-5">{f.filename}</span>
            </div>
          ))
        ) : (
          <p className="muted text-sm leading-6">
            No sources yet. Add your first document to give your study session a
            starting point.
          </p>
        )}
      </div>
    </div>
  );
  return (
    <div className="mx-auto max-w-[1440px]">
      <Link
        href="/Dashboard"
        className="inline-flex items-center gap-2 muted text-sm mb-5"
      >
        <ArrowLeft size={16} />
        All projects
      </Link>
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-semibold break-words">
            {title}
          </h1>
          <p className="muted mt-2 text-sm">
            Understand it. Remember it. Put it into practice.
          </p>
        </div>
        <Button
          variant="outline"
          className="lg:hidden"
          onClick={() => setSourcesOpen(true)}
        >
          <FileText size={16} />
          Sources ({files.length})
        </Button>
        <Button
          variant="outline"
          className="hidden lg:inline-flex"
          onClick={() => setDesktopSources((v) => !v)}
        >
          <FileText size={16} />
          {desktopSources ? "Hide" : "Show"} sources ({files.length})
        </Button>
      </div>
      <div
        className="mt-7 flex gap-1 border-b"
        role="tablist"
        aria-label="Study activities"
      >
        {(
          [
            { id: "chat", label: "Chat", icon: MessageSquare },
            { id: "flashcards", label: "Flashcards", icon: Layers },
            { id: "quiz", label: "Quiz", icon: BookOpen },
          ] as const
        ).map(({ id: tabId, label, icon: Icon }, index) => (
          <button
            key={tabId}
            role="tab"
            id={`tab-${tabId}`}
            aria-controls={`panel-${tabId}`}
            aria-selected={tab === tabId}
            tabIndex={tab === tabId ? 0 : -1}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                e.preventDefault();
                const next = (["chat", "flashcards", "quiz"] as Tab[])[
                  (index + (e.key === "ArrowRight" ? 1 : 2)) % 3
                ];
                setTab(next);
                document.getElementById(`tab-${next}`)?.focus();
              }
            }}
            onClick={() => setTab(tabId)}
            className={`flex items-center gap-2 px-4 py-4 text-sm border-b-2 ${tab === tabId ? "border-blue-500 accent font-medium" : "border-transparent muted"}`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>
      {error && (
        <div
          role="alert"
          className="notice my-4 flex flex-wrap items-center justify-between gap-2"
        >
          <span>{error}</span>
          <Button variant="outline" size="sm" disabled={!!busy} onClick={load}>
            Reload project
          </Button>
        </div>
      )}
      {notice && (
        <p role="status" className="notice my-4">
          {notice}
        </p>
      )}
      <div
        className={`grid gap-6 mt-6 ${desktopSources ? "lg:grid-cols-[minmax(0,1fr)_280px]" : ""}`}
      >
        <section
          role="tabpanel"
          id={`panel-${tab}`}
          aria-labelledby={`tab-${tab}`}
          className="surface rounded-xl min-w-0 overflow-hidden"
        >
          {tab === "chat" ? (
            <div className="flex flex-col h-[max(560px,calc(100dvh-300px))]">
              <div className="flex flex-wrap justify-between items-center gap-3 border-b p-4">
                <div className="min-w-0">
                  <label htmlFor="conversation" className="sr-only">
                    Conversation history
                  </label>
                  <select
                    id="conversation"
                    className="max-w-full rounded-lg border bg-[var(--surface)] p-2 text-sm"
                    value={session}
                    disabled={!!busy || loading}
                    onChange={(e) => void chooseSession(e.target.value)}
                  >
                    <option value="">New conversation</option>
                    {sessions.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.title || "Conversation"}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!!busy}
                  onClick={() => void chooseSession("")}
                >
                  <Plus size={16} />
                  New chat
                </Button>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-8 space-y-6">
                {chatLoading ? (
                  <p className="muted text-sm" role="status">
                    Loading conversation…
                  </p>
                ) : messages.length ? (
                  messages.map((m, i) => (
                    <article
                      key={i}
                      className={
                        m.role === "user"
                          ? "ml-auto max-w-[90%] rounded-xl bg-blue-500/10 p-4"
                          : "max-w-3xl"
                      }
                    >
                      <p className="text-xs font-medium mb-2 accent">
                        {m.role === "user" ? "You" : "StudyMate"}
                      </p>
                      <div className="study-prose">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {m.content}
                        </ReactMarkdown>
                      </div>
                      {m.sources?.length ? (
                        <div className="mt-4 space-y-2">
                          {m.sources.map((s, n) => (
                            <details
                              key={n}
                              className="rounded-lg border px-3 py-2 text-xs"
                            >
                              <summary className="cursor-pointer accent">
                                {s.label || `Source ${n + 1}`} ·{" "}
                                {s.metadata?.filename || "Study material"}
                              </summary>
                              <p className="muted mt-3 leading-6 whitespace-pre-wrap">
                                {s.metadata?.chunk ||
                                  "No excerpt is available for this source."}
                              </p>
                            </details>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  ))
                ) : (
                  <div className="flex min-h-64 flex-col justify-center items-center text-center">
                    <span className="rounded-2xl bg-blue-500/10 p-4 accent mb-5">
                      <MessageSquare size={28} />
                    </span>
                    <h2 className="text-xl font-semibold">
                      {files.length
                        ? "What would you like to understand?"
                        : "Good questions start with your materials."}
                    </h2>
                    <p className="muted max-w-md mt-3 text-sm leading-7">
                      {files.length
                        ? "Ask about a concept, compare ideas, or work through a difficult passage. Your sources keep the conversation grounded."
                        : "Open Sources and upload your notes. Then ask a question, create flashcards, or try a quiz."}
                    </p>
                    {!files.length && (
                      <Button
                        variant="outline"
                        className="mt-5"
                        onClick={() => {
                          setSourcesOpen(true);
                        }}
                      >
                        <Upload size={16} />
                        Add sources
                      </Button>
                    )}
                  </div>
                )}
                {busy === "chat" && (
                  <p className="muted text-sm" role="status">
                    Working through your question…
                  </p>
                )}
                <div ref={bottom} />
              </div>
              <form onSubmit={send} className="border-t p-4">
                <label htmlFor="chat-input" className="sr-only">
                  Ask about your materials
                </label>
                <div className="flex items-end gap-3">
                  <textarea
                    id="chat-input"
                    rows={2}
                    className="flex-1 min-w-0 resize-none rounded-lg border bg-transparent px-3 py-2 text-sm"
                    placeholder="Ask about your materials…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        !e.nativeEvent.isComposing
                      ) {
                        e.preventDefault();
                        send(e);
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!!busy || chatLoading || !input.trim()}
                    aria-label="Send question"
                  >
                    <Send size={18} />
                  </Button>
                </div>
                <p className="muted text-xs mt-2">
                  Check important details against your sources.
                </p>
              </form>
            </div>
          ) : (
            <div className="p-5 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-xl font-semibold">
                    {tab === "flashcards"
                      ? "A little practice, a stronger memory."
                      : "Check your understanding."}
                  </h2>
                  <p className="muted mt-2 text-sm">
                    {tab === "flashcards"
                      ? "Take one idea at a time. Reveal the answer when you’re ready."
                      : "Choose an answer to get feedback, then move to the next question."}
                  </p>
                </div>
                <Button
                  variant="outline"
                  disabled={!!busy || loading || !files.length}
                  onClick={() => void generate(tab)}
                >
                  {busy === tab
                    ? "Generating…"
                    : (tab === "flashcards" ? cards.length : questions.length)
                      ? "Generate a new set"
                      : "Generate from sources"}
                </Button>
              </div>
              {tab === "flashcards" ? (
                cards.length ? (
                  <>
                    <p className="muted text-sm mb-4">
                      Card {cardIndex + 1} of {cards.length}
                    </p>
                    <button
                      aria-label={flipped ? "Show question" : "Reveal answer"}
                      onClick={() => setFlipped((v) => !v)}
                      className="w-full min-h-72 rounded-xl border bg-blue-500/5 p-8 text-center"
                    >
                      <span className="eyebrow block mb-6">
                        {flipped ? "Answer" : "Question"}
                      </span>
                      <span className="block text-xl sm:text-2xl leading-relaxed whitespace-pre-wrap">
                        {flipped
                          ? cards[cardIndex]?.answer
                          : cards[cardIndex]?.question}
                      </span>
                      <span className="muted block mt-8 text-sm">
                        {flipped
                          ? "Click to see the question"
                          : "Click to reveal the answer"}
                      </span>
                    </button>
                    <div className="flex justify-between items-center gap-3 mt-5">
                      <Button
                        variant="outline"
                        disabled={cardIndex === 0}
                        onClick={() => {
                          setCardIndex((v) => v - 1);
                          setFlipped(false);
                        }}
                      >
                        <ChevronLeft size={16} />
                        Previous
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setFlipped((v) => !v)}
                      >
                        {flipped ? "Question" : "Reveal"}
                      </Button>
                      <Button
                        variant="outline"
                        disabled={cardIndex === cards.length - 1}
                        onClick={() => {
                          setCardIndex((v) => v + 1);
                          setFlipped(false);
                        }}
                      >
                        Next
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </>
                ) : (
                  <EmptyStudy kind="flashcards" />
                )
              ) : questions.length ? (
                finished ? (
                  <div className="py-14 text-center">
                    <BookOpen size={36} className="accent mx-auto mb-5" />
                    <h3 className="text-3xl font-semibold">
                      {score} / {questions.length}
                    </h3>
                    <p className="muted mt-3 mb-6">
                      Quiz complete. Keep practicing the ideas you want to
                      remember.
                    </p>
                    <Button onClick={restart}>Try this quiz again</Button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-sm muted mb-3">
                      <span>
                        Question {quizIndex + 1} of {questions.length}
                      </span>
                      <span>{score} correct</span>
                    </div>
                    <progress
                      className="w-full h-1 accent-blue-500 mb-8"
                      value={quizIndex}
                      max={questions.length}
                      aria-label="Quiz progress"
                    />
                    <h3 className="text-xl font-medium leading-8 mb-6">
                      {questions[quizIndex]?.question}
                    </h3>
                    <div className="space-y-3">
                      {questions[quizIndex]?.options.map((option, i) => (
                        <button
                          key={i}
                          disabled={answer !== null}
                          onClick={() => setAnswer(option)}
                          className={`w-full text-left rounded-xl border p-4 text-sm leading-6 disabled:cursor-default ${answer !== null && option === questions[quizIndex].correctAnswer ? "border-emerald-500 bg-emerald-500/10" : answer === option ? "border-red-500 bg-red-500/10" : "hover:border-blue-500"}`}
                        >
                          <span className="muted mr-3">
                            {String.fromCharCode(65 + i)}.
                          </span>
                          {option}
                        </button>
                      ))}
                    </div>
                    {answer !== null && (
                      <div className="mt-6">
                        <p role="status" className="text-sm mb-4">
                          {answer === questions[quizIndex].correctAnswer
                            ? "That’s correct."
                            : `Correct answer: ${questions[quizIndex].correctAnswer}`}
                        </p>
                        <Button onClick={nextQuestion}>
                          {quizIndex === questions.length - 1
                            ? "See results"
                            : "Next question"}
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    )}
                  </>
                )
              ) : (
                <EmptyStudy kind="quiz" />
              )}
            </div>
          )}
        </section>
        {desktopSources && (
          <aside className="surface rounded-xl p-5 hidden lg:block self-start">
            {sources}
          </aside>
        )}
      </div>
      <Sheet open={sourcesOpen} onOpenChange={setSourcesOpen}>
        <SheetContent className="w-full sm:max-w-sm overflow-y-auto">
          <SheetTitle>Project sources</SheetTitle>
          <SheetDescription>
            Add and review your study materials.
          </SheetDescription>
          <div className="mt-6">{sources}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
function EmptyStudy({ kind }: { kind: string }) {
  return (
    <div className="rounded-xl border border-dashed p-10 text-center">
      <Layers size={30} className="accent mx-auto mb-4" />
      <h3 className="text-lg font-medium">Your {kind} will appear here.</h3>
      <p className="muted text-sm mt-3 leading-7">
        Add sources, then choose “Generate from sources” to start practicing.
      </p>
    </div>
  );
}
