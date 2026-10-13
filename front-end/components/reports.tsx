"use client";
import { useEffect, useRef, useState } from "react";
import { ChatAnswer, ChatSource } from "@/components/chat-answer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { readChatStream } from "@/lib/chat-stream";
import { reportMarkdown } from "@/lib/report-export";

type Coverage = {
  filename: string;
  total_chunks: number;
  included_chunks: number;
  partial: boolean;
};
type Summary = { id: string; title: string; created_at: string; topic: string };
type SavedReport = Summary & {
  content: string;
  sources: ChatSource[];
  coverage: Coverage[];
  selected_source_ids: string[];
};
type Event =
  | { type: "sources"; data: { sources: ChatSource[]; coverage: Coverage[] } }
  | { type: "delta"; data: { text: string } }
  | { type: "completion"; data: { report: SavedReport } }
  | { type: "error"; data: { message: string } };

export function Reports({
  projectId,
  files,
}: {
  projectId: string;
  files: { file_id: string; filename: string; status?: string }[];
}) {
  const [reports, setReports] = useState<Summary[]>([]);
  const [selected, setSelected] = useState<string[] | null>(null);
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [sources, setSources] = useState<ChatSource[]>([]);
  const [coverage, setCoverage] = useState<Coverage[]>([]);
  const [current, setCurrent] = useState<Summary | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [interrupted, setInterrupted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Summary | null>(null);
  const controller = useRef<AbortController | null>(null);
  const lock = useRef(false);
  const deleteTrigger = useRef<HTMLButtonElement | null>(null);
  const ready = files.filter((f) => f.status === "completed");
  const ids = selected ?? ready.map((f) => f.file_id);
  const base = `${process.env.NEXT_PUBLIC_backend_url}/projects/${projectId}/reports`;
  const headers = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });
  async function request(url: string, init: RequestInit = {}) {
    const response = await fetch(url, { ...init, headers: headers() });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(
        typeof data.error === "string"
          ? data.error
          : "Couldn’t load reports. Please try again.",
      );
    }
    return response;
  }
  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setReports((await (await request(base)).json()).reports);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn’t load reports.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    fetch(base, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      signal: abort.signal,
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("Couldn’t load reports. Please try again.");
        return r.json();
      })
      .then((data) => {
        if (!abort.signal.aborted) setReports(data.reports);
      })
      .catch((e) => {
        if (!abort.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => {
      abort.abort();
      controller.current?.abort();
    };
  }, [base]);
  async function generate() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    setContent("");
    setSources([]);
    setCoverage([]);
    setCurrent(null);
    setInterrupted(false);
    const abort = new AbortController();
    controller.current = abort;
    try {
      const response = await request(`${base}/generate/stream`, {
        method: "POST",
        body: JSON.stringify({ source_ids: ids, topic }),
        signal: abort.signal,
      });
      if (!response.body) throw new Error("Streaming is unavailable.");
      await readChatStream<Event>(response.body, (event) => {
        if (event.type === "sources") {
          setSources(event.data.sources);
          setCoverage(event.data.coverage);
        }
        if (event.type === "delta") setContent((old) => old + event.data.text);
        if (event.type === "error") throw new Error(event.data.message);
        if (event.type === "completion") {
          const report = event.data.report;
          setContent(report.content);
          setSources(report.sources);
          setCoverage(report.coverage);
          setCurrent(report);
          setReports((old) => [
            report,
            ...old.filter((r) => r.id !== report.id),
          ]);
          setNotice("Report saved.");
        }
      });
    } catch (e) {
      if (!abort.signal.aborted) {
        setInterrupted(true);
        setError(
          e instanceof Error ? e.message : "Report interrupted. Try again.",
        );
      }
    } finally {
      lock.current = false;
      setBusy(false);
      controller.current = null;
    }
  }
  async function openReport(id: string) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { report } = await (await request(`${base}/${id}`)).json();
      setCurrent(report);
      setContent(report.content);
      setSources(report.sources);
      setCoverage(report.coverage);
      setTopic(report.topic);
      setSelected(report.selected_source_ids);
      setInterrupted(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn’t open report.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function removeReport() {
    if (!confirmDelete || lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      await request(`${base}/${confirmDelete.id}`, { method: "DELETE" });
      setReports((old) => old.filter((r) => r.id !== confirmDelete.id));
      if (current?.id === confirmDelete.id) {
        setCurrent(null);
        setContent("");
        setSources([]);
        setCoverage([]);
      }
      setConfirmDelete(null);
      setNotice("Report deleted.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn’t delete report.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const unavailable = ids.some((id) => !ready.some((f) => f.file_id === id));
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <header>
        <h2 className="text-xl font-semibold">Source-based reports</h2>
        <p className="muted text-sm mt-2">
          Turn your materials into a cited educational article. Each version is
          saved separately.
        </p>
      </header>
      <fieldset disabled={busy} className="space-y-3">
        <legend className="font-medium mb-2">
          Choose sources ({ids.length}/20)
        </legend>
        {!files.length && (
          <p className="muted text-sm">
            Add sources to the project to get started.
          </p>
        )}
        <div className="max-h-52 overflow-y-auto space-y-2">
          {files.map((file) => (
            <label
              className="flex gap-3 items-start text-sm"
              key={file.file_id}
            >
              <input
                type="checkbox"
                className="mt-1"
                checked={ids.includes(file.file_id)}
                disabled={file.status !== "completed"}
                onChange={(e) =>
                  setSelected(
                    e.target.checked
                      ? [...ids, file.file_id]
                      : ids.filter((id) => id !== file.file_id),
                  )
                }
              />
              <span className="break-all">
                {file.filename}
                {file.status !== "completed" && (
                  <span className="muted"> · {file.status || "Not ready"}</span>
                )}
              </span>
            </label>
          ))}
        </div>
        <button
          type="button"
          className="accent text-sm underline"
          onClick={() => setSelected(null)}
        >
          Select all ready sources
        </button>
        <label htmlFor="report-topic" className="block text-sm font-medium">
          Topic or focus (optional)
        </label>
        <textarea
          id="report-topic"
          maxLength={1000}
          rows={2}
          className="w-full rounded-lg border bg-transparent p-3 text-sm"
          placeholder="For example: Explain the main concepts for a beginner"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </fieldset>
      {unavailable && (
        <p className="notice text-sm">
          Some selected sources are no longer ready or available. Select all
          ready sources or update your selection.
        </p>
      )}
      {ids.length > 20 && (
        <p className="notice text-sm">Choose no more than 20 sources.</p>
      )}
      <Button
        disabled={
          busy || loading || !ids.length || ids.length > 20 || unavailable
        }
        onClick={generate}
      >
        {busy
          ? "Working…"
          : current
            ? "Generate another version"
            : "Generate report"}
      </Button>
      {error && (
        <div role="alert" className="notice">
          {error}{" "}
          <button
            className="accent underline"
            disabled={busy}
            onClick={refresh}
          >
            Reload saved reports
          </button>
        </div>
      )}
      {notice && (
        <p role="status" className="notice">
          {notice}
        </p>
      )}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Saved reports</h3>
          <Button
            variant="ghost"
            size="sm"
            disabled={loading || busy}
            onClick={refresh}
          >
            Refresh
          </Button>
        </div>
        {loading ? (
          <p role="status" className="muted text-sm">
            Loading reports…
          </p>
        ) : !reports.length ? (
          <p className="muted text-sm">No saved reports yet.</p>
        ) : (
          <ul className="space-y-2">
            {reports.map((report) => (
              <li
                className="flex items-center justify-between gap-3 border rounded-lg p-3"
                key={report.id}
              >
                <button
                  className="text-left min-w-0"
                  disabled={busy}
                  onClick={() => openReport(report.id)}
                >
                  <span className="block break-words accent">
                    {report.title}
                  </span>
                  <span className="text-xs muted">
                    {new Date(report.created_at).toLocaleString()}
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={(event) => {
                    deleteTrigger.current = event.currentTarget;
                    setError("");
                    setConfirmDelete(report);
                  }}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
      {(content || busy) && (
        <section className="border-t pt-5 space-y-4">
          {busy && !current && (
            <p role="status" className="muted text-sm">
              Generating report… Draft text is not saved until validation
              completes.
            </p>
          )}
          {interrupted && (
            <p className="notice">
              This draft was interrupted and may not be saved. Reload saved
              reports to check, or generate again.
            </p>
          )}
          {coverage.some((c) => c.partial) && (
            <div className="notice text-sm">
              This report uses selected excerpts, not entire documents.
              <ul>
                {coverage.map((c) => (
                  <li key={c.filename}>
                    {c.filename}: {c.included_chunks} of {c.total_chunks} chunks
                    {c.partial ? " (excerpted)" : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {current && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      reportMarkdown(content, sources),
                    );
                    setNotice("Report copied.");
                  } catch {
                    setError(
                      "Couldn’t copy. Download the Markdown file instead.",
                    );
                  }
                }}
              >
                Copy report
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const url = URL.createObjectURL(
                    new Blob([reportMarkdown(content, sources)], {
                      type: "text/markdown;charset=utf-8",
                    }),
                  );
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `${current.title.replace(/[^a-z0-9 -]/gi, "").slice(0, 80) || "report"}.md`;
                  link.click();
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                }}
              >
                Download Markdown
              </Button>
            </div>
          )}
          <article className="study-prose break-words">
            <ChatAnswer content={content} sources={sources} />
          </article>
          <p className="muted text-xs">
            Citations link to provided excerpts. Citation checks do not prove
            factual accuracy; review before sharing.
          </p>
        </section>
      )}
      <Dialog
        open={!!confirmDelete}
        onOpenChange={(open) => {
          if (!open && !busy) setConfirmDelete(null);
        }}
      >
        <DialogContent
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (deleteTrigger.current?.isConnected)
              deleteTrigger.current.focus();
            else document.getElementById("report-topic")?.focus();
          }}
        >
          <DialogTitle>Delete report?</DialogTitle>
          <DialogDescription>
            This permanently deletes “{confirmDelete?.title}”. Your source
            documents remain available.
          </DialogDescription>
          {error && (
            <p role="alert" className="notice text-sm">
              {error}
            </p>
          )}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setConfirmDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={removeReport}
            >
              Delete report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
