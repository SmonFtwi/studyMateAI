"use client";

import React, { useEffect, useState } from "react";
import { useAuthContext } from "@/context/authContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaComments, 
  FaDatabase, 
  FaUser, 
  FaUsersCog 
} from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  GraduationCap,
  LogOut,
  MoreVertical,
  PlusCircle,
  Settings,
  Sparkles,
  Trash2,
  User,
  LayoutDashboard,
  Cpu,
  Shield,
  Activity
} from "lucide-react";
import { 
  createProject, 
  deleteProject, 
  getProjects 
} from "@/lib/apicall/project";
import CreateProjectDialog from "./createProject";
import { Button } from "../ui/button";

interface Projects {
  project_id: string;
  title: string;
  description: string;
}

export default function Sidebar() {
  const { user, logout } = useAuthContext();
  const [projects, setProjects] = useState<Projects[]>([]);
  const [open, setOpen] = useState(false);

  const handleCreateProject = async (data: {
    name: string;
    description: string;
  }) => {
    const token = localStorage.getItem("token") as string;
    await createProject(token, {
      title: data.name,
      description: data.description,
    });
    setOpen(false);
    fetchProjects(token);
  };

  useEffect(() => {
    const token = localStorage.getItem("token") as string;
    if (token) fetchProjects(token);
  }, []);

  const fetchProjects = async (token: string) => {
    try {
      const response = await getProjects(token);
      setProjects(response.projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleDeleteProject = async (project_id: string) => {
    const token = localStorage.getItem("token") as string;
    await deleteProject(token, project_id);
    fetchProjects(token);
  };

  return (
    <div className="flex flex-col h-full glass-cosmos border-white/5 relative overflow-hidden group/sidebar transition-all duration-500 rounded-3xl">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 blur-[100px] rounded-full group-hover/sidebar:bg-purple-500/20 transition-all duration-1000" />

      {/* Header: Project Initialization */}
      <div className="p-6 space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/30 blur-md rounded-lg animate-pulse" />
              <div className="w-10 h-10 bg-slate-900 rounded-lg border border-white/10 flex items-center justify-center relative overflow-hidden group/logo">
                <Cpu className="w-6 h-6 text-purple-400 group-hover/logo:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-black tracking-[0.2em] text-white/40 uppercase leading-none mb-1">Terminal</h2>
              <h1 className="text-lg font-black tracking-tight text-white">CORE<span className="text-purple-500">_V1</span></h1>
            </div>
          </div>
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => setOpen(true)}
            className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-0 rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.2)] group/btn relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
            <PlusCircle className="mr-2 h-5 w-5" />
            <span className="font-bold tracking-wider uppercase text-xs">Initialize Project</span>
          </Button>
        </motion.div>

        <CreateProjectDialog
          open={open}
          onOpenChange={setOpen}
          onCreate={handleCreateProject}
        />
      </div>

      {/* System Status Indicators */}
      <div className="px-6 py-2 flex items-center gap-4 border-y border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-purple-400/50" />
          <span className="text-[9px] font-black tracking-widest text-white/20 uppercase">Secure</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-blue-400/50" />
          <span className="text-[9px] font-black tracking-widest text-white/20 uppercase">AI Active</span>
        </div>
      </div>

      {/* Project Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1 custom-scrollbar relative z-10">
        <h3 className="px-2 text-[10px] font-black tracking-[0.3em] text-white/20 uppercase mb-4">Active Modules</h3>
        
        <AnimatePresence mode="popLayout">
          {projects.map((project, idx) => (
            <motion.div
              key={project.project_id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group/item relative"
            >
              <Link
                href={`/Dashboard/projects/${project.project_id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300 overflow-hidden relative"
              >
                <div className="flex items-center gap-3 min-w-0 relative z-10">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/item:bg-purple-500/20 transition-colors">
                    <FaComments className="text-purple-400/50 group-hover/item:text-purple-400" />
                  </div>
                  <span className="truncate text-sm font-bold text-white/60 group-hover/item:text-white transition-colors">
                    {project.title}
                  </span>
                </div>

                <div className="flex items-center opacity-0 group-hover/item:opacity-100 transition-opacity relative z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-white/40" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-cosmos border-white/10 bg-slate-900/95">
                      <DropdownMenuItem 
                        onClick={() => handleDeleteProject(project.project_id)}
                        className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        <span>Purge Project</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>

        {projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/5">
              <FaComments className="text-white/10 text-xl" />
            </div>
            <p className="text-xs font-bold text-white/20 uppercase tracking-widest">No active modules found</p>
          </div>
        )}
      </div>

      {/* Footer: Admin & Settings */}
      <div className="p-4 space-y-2 relative z-10 border-t border-white/5 bg-black/20">
        {user?.role === "admin" && (
          <div className="grid grid-cols-3 gap-2 mb-2">
            <TooltipProvider>
              {[
                { href: "/Dashboard/users", icon: FaUser, label: "Users" },
                { href: "/Dashboard/Manageusers", icon: FaUsersCog, label: "Manage" },
                { href: "/Dashboard/listPdf", icon: FaDatabase, label: "Storage" }
              ].map((item) => (
                <Tooltip key={item.label}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className="flex items-center justify-center h-10 rounded-xl bg-white/5 hover:bg-purple-500/20 border border-white/5 hover:border-purple-500/30 transition-all group/admin"
                    >
                      <item.icon className="text-white/30 group-hover/admin:text-purple-400" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="glass-cosmos border-white/10 text-[10px] font-black uppercase tracking-widest">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
        )}

        <Link
          href="/Dashboard/Dash"
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group/nav"
        >
          <LayoutDashboard className="w-4 h-4 text-blue-400/50 group-hover/nav:text-blue-400" />
          <span className="text-sm font-bold text-white/50 group-hover/nav:text-white transition-colors uppercase tracking-widest text-[10px]">Dashboard</span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group/nav cursor-pointer">
              <Settings className="w-4 h-4 text-pink-400/50 group-hover/nav:text-pink-400" />
              <span className="text-sm font-bold text-white/50 group-hover/nav:text-white transition-colors uppercase tracking-widest text-[10px]">Settings</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass-cosmos border-white/10 bg-slate-900/95 p-2">
            <DropdownMenuLabel className="text-[10px] font-black text-white/30 uppercase tracking-widest px-2 mb-1">Control Panel</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/Dashboard/profile" className="flex items-center gap-2 p-3 rounded-lg hover:bg-white/5 cursor-pointer">
                <User className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-sm">Neural Identity</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem onClick={logout} className="flex items-center gap-2 p-3 rounded-lg hover:bg-red-500/10 text-red-400 cursor-pointer focus:text-red-300">
              <LogOut className="w-4 h-4" />
              <span className="font-bold text-sm">Terminate Link</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Decorative Border Glow */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
    </div>
  );
}


