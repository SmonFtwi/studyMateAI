"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, MoreVertical, Trash2 } from "lucide-react";
import CreateProjectDialog from "./createProject";
import {
  createProject,
  getProjects,
  deleteProject,
} from "@/lib/apicall/project";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Project {
  project_id: string;
  title: string;
  description: string;
  created_at?: string;
  sources?: number;
}

// Project gradient colors for variety
const gradientColors = [
  "from-yellow-500 to-orange-500",
  "from-purple-500 to-pink-500",
  "from-blue-500 to-cyan-500",
  "from-green-500 to-emerald-500",
  "from-red-500 to-rose-500",
  "from-indigo-500 to-purple-500",
];

export default function MainPage() {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token") as string;
      const response = await getProjects(token);
      const normalized =
        response?.projects?.map((p: any) => ({
          project_id: p.project_id || p._id,
          title: p.title,
          description: p.description,
          created_at: p.createdAt || p.created_at,
          sources: p.sources || p.filesCount || 0,
        })) || [];
      setProjects(normalized);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (data: {
    name: string;
    description: string;
  }) => {
    const token = localStorage.getItem("token") as string;
    const res = await createProject(token, {
      title: data.name,
      description: data.description,
    });

    const created = res?.project;
    if (created) {
      setProjects((prev) => [
        {
          project_id: created._id || created.project_id,
          title: created.title,
          description: created.description,
          created_at: created.createdAt || created.created_at,
          sources: created.sources || 0,
        },
        ...prev,
      ]);
    } else {
      await fetchProjects();
    }

    setOpen(false);
  };

  const handleDeleteProject = async (project_id: string) => {
    try {
      const token = localStorage.getItem("token") as string;
      await deleteProject(token, project_id);
      fetchProjects(); // Refresh the list
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <main className="flex flex-col h-[calc(100vh-100px)] items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading projects...</div>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen p-8 overflow-y-auto bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-gray-100 transition-colors">
      <div className="max-w-7xl w-full mx-auto">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-gray-200 mb-6">
          Recent Projects
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
          {/* Create New Project Card */}
          <button
            onClick={() => setOpen(true)}
            className="
              group relative
              bg-white/90 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800/50
              border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600
              rounded-2xl p-6
              transition-all duration-300
              flex flex-col items-center justify-center
              min-h-[220px] h-full
              cursor-pointer
              shadow-sm dark:shadow-none
            "
          >
            <div
              className="
              w-16 h-16 rounded-2xl
              bg-slate-100 dark:bg-slate-700/50 group-hover:bg-slate-200 dark:group-hover:bg-slate-700
              flex items-center justify-center
              mb-4
              transition-all duration-300
            "
            >
              <PlusCircle className="w-8 h-8 text-slate-500 dark:text-gray-400 group-hover:text-slate-700 dark:group-hover:text-gray-200" />
            </div>
            <span className="text-slate-700 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-gray-100 font-medium transition-colors">
              Create new project
            </span>
          </button>

          {/* Project Cards */}
          {projects.map((project, index) => (
            <div
              key={project.project_id}
              className="
                group relative
                bg-white/95 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800/70
                border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600
                rounded-2xl p-6
                transition-all duration-300
                flex flex-col h-full
                min-h-[220px]
                shadow-sm dark:shadow-none
              "
            >
              {/* Three Dots Menu */}
              <div className="absolute top-4 right-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="
                      p-1.5 rounded-lg
                      opacity-0 group-hover:opacity-100
                      hover:bg-slate-100 dark:hover:bg-slate-700/50
                      transition-all duration-200
                    "
                    >
                      <MoreVertical className="w-4 h-4 text-slate-400 dark:text-gray-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-slate-200 dark:border-slate-700"
                  >
                    <DropdownMenuItem
                      onClick={() => handleDeleteProject(project.project_id)}
                      className="flex items-center gap-2 text-red-500 dark:text-red-400 hover:text-red-400 dark:hover:text-red-300 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Project Content */}
              <Link
                href={`/Dashboard/projects/${project.project_id}`}
                className="flex flex-col flex-1"
              >
                {/* Title */}
                <h3 className="text-slate-900 dark:text-gray-200 font-medium text-lg mb-2 line-clamp-1">
                  {project.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-600 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                  {project.description || "No description"}
                </p>

                {/* Meta Info */}
                <div className="mt-auto pt-2 border-t border-slate-200 dark:border-slate-700/50">
                  <p className="text-xs text-slate-500 dark:text-gray-500">
                    {formatDate(project.created_at)} · {project.sources || 0}{" "}
                    sources
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="text-center py-16">
            <Avatar className="mb-6 rounded-full w-24 h-24 mx-auto">
              <AvatarImage src="/studyMate2.png" alt="Bot Avatar" />
            </Avatar>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-gray-200">
              StudyMate AI
            </h1>
            <p className="text-slate-600 dark:text-gray-400 mt-3 mb-6 max-w-md mx-auto">
              Start a new project to organize your learning materials and ideas.
            </p>
          </div>
        )}
      </div>

      <CreateProjectDialog
        open={open}
        onOpenChange={setOpen}
        onCreate={handleCreateProject}
      />
    </main>
  );
}
