"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Folder, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import CreateProjectDialog from "./createProject";
import {
  createProject,
  getProjects,
  deleteProject,
} from "@/lib/apicall/project";
interface Project {
  project_id: string;
  title: string;
  description?: string;
  created_at?: string;
  createdAt?: string;
  _id?: string;
}
export default function MainPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getProjects(localStorage.getItem("token") || "");
      setProjects(
        (res.projects || []).map((p: Project) => ({
          ...p,
          project_id: p.project_id || p._id,
        })),
      );
    } catch {
      setError("Your projects couldn’t be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const create = async (data: { name: string; description: string }) => {
    const res = await createProject(localStorage.getItem("token") || "", {
      title: data.name,
      description: data.description,
    });
    const id = res.project?.project_id || res.project?._id;
    if (id) router.push(`/Dashboard/projects/${id}`);
    else await load();
  };
  async function remove() {
    if (!deleting || busy) return;
    setBusy(true);
    try {
      await deleteProject(
        localStorage.getItem("token") || "",
        deleting.project_id,
      );
      setProjects((p) => p.filter((x) => x.project_id !== deleting.project_id));
      setDeleting(null);
    } catch {
      setError("The project couldn’t be deleted. Please try again.");
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  }
  const visible = projects.filter((p) =>
    `${p.title} ${p.description || ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap justify-between gap-5 items-center">
        <div>
          <p className="eyebrow mb-2">Your workspace</p>
          <h1 className="page-heading">A place for every subject.</h1>
          <p className="muted mt-3 text-sm">
            Pick up a project, or make room for something new.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={18} />
          New project
        </Button>
      </div>
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-b pb-5">
        <h2 className="font-medium">
          Your projects{" "}
          <span className="muted ml-2 text-sm">{projects.length}</span>
        </h2>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-3 muted" size={16} />
          <Input
            className="pl-9 h-10"
            aria-label="Search projects"
            placeholder="Search projects…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      {error && (
        <div
          role="alert"
          className="notice mt-5 flex flex-wrap items-center justify-between gap-3"
        >
          {error}
          <Button variant="outline" onClick={load}>
            Try again
          </Button>
        </div>
      )}
      {loading ? (
        <div role="status" className="py-16 muted">
          Loading your projects…
        </div>
      ) : projects.length === 0 && !error ? (
        <div className="surface my-6 rounded-2xl p-10 sm:p-16 text-center">
          <Folder size={32} className="accent mx-auto mb-5" />
          <h2 className="text-2xl font-semibold">
            Start with what you&apos;re learning.
          </h2>
          <p className="muted mx-auto mt-3 max-w-md text-sm leading-7">
            Create a project, add your notes, then explore them with chat,
            flashcards, and quizzes.
          </p>
          <Button className="mt-6" onClick={() => setOpen(true)}>
            <Plus size={16} />
            Create your first project
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 py-6 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((p, i) => (
            <article
              key={p.project_id}
              className="surface group rounded-xl p-6 flex min-h-56 flex-col transition-colors hover:border-blue-500/50"
            >
              <div className="flex justify-between items-center">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${["bg-blue-500/10 text-blue-500", "bg-violet-500/10 text-violet-500", "bg-emerald-500/10 text-emerald-500"][i % 3]}`}
                >
                  <Folder size={20} />
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Delete ${p.title}`}
                  onClick={() => setDeleting(p)}
                >
                  <Trash2 size={16} className="muted" />
                </Button>
              </div>
              <h3 className="mt-5 text-lg font-semibold break-words">
                <Link href={`/Dashboard/projects/${p.project_id}`}>
                  {p.title}
                </Link>
              </h3>
              <p className="muted mt-2 text-sm leading-6 line-clamp-2">
                {p.description || "Add your materials and start exploring."}
              </p>
              <div className="mt-auto pt-6 flex items-center justify-between">
                <span className="muted text-xs">
                  {(p.created_at || p.createdAt) &&
                  !isNaN(new Date(p.created_at || p.createdAt || "").getTime())
                    ? `Created ${new Date(p.created_at || p.createdAt || "").toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
                    : "Study project"}
                </span>
                <Link
                  className="accent flex items-center gap-1 text-sm"
                  href={`/Dashboard/projects/${p.project_id}`}
                >
                  Open project
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
      {!loading && projects.length > 0 && visible.length === 0 && (
        <p className="muted py-12 text-center">
          No projects match “{query}”. Try another search.
        </p>
      )}
      <CreateProjectDialog
        open={open}
        onOpenChange={setOpen}
        onCreate={create}
      />
      <Dialog
        open={!!deleting}
        onOpenChange={(v) => !v && !busy && setDeleting(null)}
      >
        <DialogContent>
          <DialogTitle>Delete “{deleting?.title}”?</DialogTitle>
          <DialogDescription>
            This permanently deletes the project and its study materials. This
            action cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setDeleting(null)}
            >
              Cancel
            </Button>
            <Button variant="destructive" disabled={busy} onClick={remove}>
              {busy ? "Deleting…" : "Delete project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
