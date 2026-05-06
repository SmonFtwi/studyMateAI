"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreVertical, Trash2, LayoutGrid, Clock, Database, Sparkles, FolderPlus } from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";

interface Project {
  project_id: string;
  title: string;
  description: string;
  created_at?: string;
  sources?: number;
}

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
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "RECENTLY ACTIVE";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
          <div className="h-8 w-64 bg-white/5 border border-white/10 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 glass-cosmos border-white/5 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/[0.02] animate-pulse" />
              <div className="space-y-4 relative z-10">
                <div className="h-6 w-3/4 bg-white/5 rounded-lg" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-white/5 rounded-lg" />
                  <div className="h-4 w-2/3 bg-white/5 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
            <div className="w-14 h-14 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center relative overflow-hidden">
              <LayoutGrid className="w-7 h-7 text-purple-400" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
              Project<span className="text-purple-500 text-4xl">.</span>Hub
            </h1>
            <p className="text-xs font-black text-white/30 tracking-[0.2em] uppercase mt-1">
              Neural Network Archives // Active Modules: {projects.length}
            </p>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => setOpen(true)}
            className="h-14 px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-2xl border-0 shadow-[0_0_30px_rgba(168,85,247,0.3)] group/btn relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
            <FolderPlus className="mr-3 h-5 w-5" />
            <span className="font-black tracking-[0.1em] uppercase text-xs">New Archive Module</span>
          </Button>
        </motion.div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {projects.map((project, index) => (
            <motion.div
              key={project.project_id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              layout
            >
              <div className="group/card glass-cosmos border-white/5 rounded-[2rem] p-8 min-h-[280px] flex flex-col relative overflow-hidden hover:border-purple-500/30 transition-all duration-500">
                {/* Background Text Accent */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] font-black text-white/[0.01] pointer-events-none select-none italic tracking-tighter">
                  {index + 1 < 10 ? `0${index + 1}` : index + 1}
                </div>

                {/* Dropdown Menu */}
                <div className="absolute top-6 right-6 z-20">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
                        <MoreVertical className="w-5 h-5 text-white/40" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-cosmos border-white/10 bg-slate-900/95 p-2">
                      <DropdownMenuItem 
                        onClick={() => handleDeleteProject(project.project_id)}
                        className="text-red-400 focus:text-red-300 focus:bg-red-500/10 p-3 rounded-xl cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 mr-3" />
                        <span className="font-bold text-xs uppercase tracking-widest">Decommission</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Project Header */}
                <div className="mb-6 relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                    <span className="text-[10px] font-black text-purple-500 tracking-[0.2em] uppercase italic">Module Linked</span>
                  </div>
                  <h3 className="text-2xl font-black text-white group-hover/card:text-purple-400 transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-sm font-bold text-white/40 line-clamp-3 mb-8 flex-1 leading-relaxed relative z-10">
                  {project.description || "NO DATA DESCRIPTION AVAILABLE FOR THIS ARCHIVE MODULE."}
                </p>

                {/* Footer */}
                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-white/20" />
                    <span className="text-[10px] font-black text-white/20 tracking-widest uppercase">
                      {formatDate(project.created_at)}
                    </span>
                  </div>
                  
                  <Link href={`/Dashboard/projects/${project.project_id}`}>
                    <motion.div
                      whileHover={{ scale: 1.05, x: 5 }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 group-hover/card:border-purple-500/50 group-hover/card:bg-purple-500/10 transition-all cursor-pointer"
                    >
                      <Database className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-[10px] font-black text-purple-100 uppercase tracking-widest">Access Module</span>
                    </motion.div>
                  </Link>
                </div>

                {/* Hover Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.03] to-blue-500/[0.03] opacity-0 group-hover/card:opacity-100 transition-opacity pointer-events-none" />
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full opacity-0 group-hover/card:opacity-100 transition-all duration-700" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-purple-500/20 blur-3xl animate-pulse rounded-full" />
              <div className="w-24 h-24 bg-slate-900 border border-white/10 rounded-3xl flex items-center justify-center relative overflow-hidden group">
                <Sparkles className="w-10 h-10 text-purple-400 group-hover:scale-125 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Neural Archives Empty</h3>
            <p className="text-white/30 text-sm font-bold uppercase tracking-widest max-w-sm">
              Initialize your first project module to begin the cognitive processing sequence.
            </p>
          </div>
        )}
      </div>

      <CreateProjectDialog
        open={open}
        onOpenChange={setOpen}
        onCreate={handleCreateProject}
      />
    </div>
  );
}

