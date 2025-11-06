/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useAuthContext } from "@/context/authContext";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FaComments,
  FaDatabase,
  FaPlus,
  FaUser,
  FaUsersCog,
} from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteChat, listChatHistory } from "@/lib/apicall/chat";
import { Separator } from "@/components/ui/separator";
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
  Settings,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { DashboardIcon } from "@radix-ui/react-icons";
import { deleteProject, getProjects } from "@/lib/apicall/project";

interface Projects {
  project_id: string;
  title: string;
  description: string;
}

export default function Sidebar() {
  const { user, logout } = useAuthContext();
  const [projects, setProjects] = useState<Projects[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token") as string;

    fetchProjects(token);
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
    console.log("project_id", project_id);
    const token = localStorage.getItem("token") as string;
    const response = await deleteProject(token, project_id);
    console.log("response", response);
    fetchProjects(token);
  };

  return (
    <div className="flex flex-col h-full relative rounded-lg text-gray-800 dark:text-white overflow-hidden border border-blue-200/50 dark:border-white/10">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-1/3 left-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 rounded-full blur-lg"></div>

      {/* Header Section */}
      <div className="p-4 space-y-4 relative z-10">
        <div className="flex items-center">
          <div className="flex items-center">
            <Avatar className="w-10 h-10 rounded-full">
              <AvatarImage
                src="/studyMate2.png"
                alt="StudyMate"
                className="w-full h-full object-cover"
              />
            </Avatar>
            <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse ml-1" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                StudyMate
              </h1>
              <GraduationCap className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-light">
              AI-Powered Learning
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            window.location.href = "/Dashboard";
          }}
          className="flex items-center gap-3 w-full px-4 py-3 mt-6 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] border border-blue-400/30 dark:border-white/10"
        >
          <FaPlus className="text-lg" />
          <span>New Project</span>
        </button>
      </div>

      <div className="mx-4 border-t border-blue-200/50 dark:border-white/10"></div>

      {/* Chat List */}
      <div className="flex-1 py-4 overflow-y-auto px-4 scrollbar-thin scrollbar-thumb-blue-300/50 dark:scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-blue-400/70 dark:hover:scrollbar-thumb-white/30 relative z-10">
        <div className="space-y-2">
          {projects.length > 0 ? (
            projects.map((project) => (
              <div
                key={project.project_id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-100/50 dark:hover:bg-white/10 backdrop-blur-sm transition-all duration-200 border border-transparent hover:border-blue-200/50 dark:hover:border-white/10"
              >
                {/* Chat Title */}
                <Link
                  href={`/Dashboard/?session_id=${project.project_id}`}
                  className="flex items-center space-x-3 flex-1 min-w-0"
                >
                  <FaComments className="text-lg text-blue-500 dark:text-blue-300 flex-shrink-0" />
                  <span className="truncate text-gray-700 dark:text-white/90 hover:text-gray-900 dark:hover:text-white transition-colors">
                    {project.title.split(" ").slice(0, 3).join(" ")}
                  </span>
                </Link>

                {/* Dropdown Menu for Delete */}
                <div className="relative flex-shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 rounded-full hover:bg-blue-200/50 dark:hover:bg-white/10 transition-colors duration-200">
                        <MoreVertical className="text-lg text-gray-500 dark:text-white/70 hover:text-gray-700 dark:hover:text-white" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-blue-200/50 dark:border-white/10 p-2 rounded-lg shadow-xl"
                    >
                      <DropdownMenuItem asChild>
                        <button
                          onClick={() =>
                            handleDeleteProject(project.project_id)
                          }
                          className="flex items-center space-x-2 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 w-full px-2 py-1 rounded transition-colors"
                        >
                          <Trash2 className="text-sm" />
                          <span>Delete</span>
                        </button>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-500/20 dark:to-purple-500/20 flex items-center justify-center">
                <FaComments className="text-2xl text-blue-500 dark:text-blue-300" />
              </div>
              <p className="text-sm text-gray-600 dark:text-white/60">
                No chats available yet
              </p>
              <p className="text-xs text-gray-500 dark:text-white/40 mt-1">
                Start a new conversation to get started
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Section */}
      <div className="p-4 space-y-3 relative z-10">
        {user?.role === "admin" && (
          <>
            <div className="border-t border-blue-200/50 dark:border-white/10 pt-4"></div>
            <TooltipProvider>
              <div className="grid grid-cols-3 gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/Dashboard/users"
                      className="flex items-center justify-center p-3 rounded-lg bg-blue-100/50 dark:bg-white/10 hover:bg-blue-200/50 dark:hover:bg-white/20 backdrop-blur-sm transition-all duration-200 border border-blue-200/50 dark:border-white/10 hover:border-blue-300/70 dark:hover:border-white/20"
                    >
                      <FaUser className="text-lg text-blue-600 dark:text-blue-300" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-blue-200/50 dark:border-white/10"
                  >
                    <p>Pending Accounts</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/Dashboard/Manageusers"
                      className="flex items-center justify-center p-3 rounded-lg bg-blue-100/50 dark:bg-white/10 hover:bg-blue-200/50 dark:hover:bg-white/20 backdrop-blur-sm transition-all duration-200 border border-blue-200/50 dark:border-white/10 hover:border-blue-300/70 dark:hover:border-white/20"
                    >
                      <FaUsersCog className="text-lg text-purple-600 dark:text-purple-300" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-blue-200/50 dark:border-white/10"
                  >
                    <p>Manage Users</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/Dashboard/listPdf"
                      className="flex items-center justify-center p-3 rounded-lg bg-blue-100/50 dark:bg-white/10 hover:bg-blue-200/50 dark:hover:bg-white/20 backdrop-blur-sm transition-all duration-200 border border-blue-200/50 dark:border-white/10 hover:border-blue-300/70 dark:hover:border-white/20"
                    >
                      <FaDatabase className="text-lg text-cyan-600 dark:text-cyan-300" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-blue-200/50 dark:border-white/10"
                  >
                    <p>Manage Source Data</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </>
        )}

        <div className="border-t border-blue-200/50 dark:border-white/10 pt-3"></div>

        <Link
          href={"/Dashboard/Dash"}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium bg-blue-100/50 dark:bg-white/10 hover:bg-blue-200/50 dark:hover:bg-white/20 backdrop-blur-sm transition-all duration-200 border border-blue-200/50 dark:border-white/10 hover:border-blue-300/70 dark:hover:border-white/20"
        >
          <DashboardIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
          <span className="text-gray-700 dark:text-white/90">Dashboard</span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium bg-blue-100/50 dark:bg-white/10 hover:bg-blue-200/50 dark:hover:bg-white/20 backdrop-blur-sm transition-all duration-200 border border-blue-200/50 dark:border-white/10 hover:border-blue-300/70 dark:hover:border-white/20 cursor-pointer">
              <Settings className="w-5 h-5 text-pink-600 dark:text-pink-300" />
              <span className="text-gray-700 dark:text-white/90">Settings</span>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-48 rounded-lg shadow-xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-blue-200/50 dark:border-white/10"
          >
            <DropdownMenuLabel className="text-gray-700 dark:text-white/80">
              Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="border-blue-200/50 dark:border-white/10" />
            <DropdownMenuItem asChild>
              <Link
                href="/Dashboard/profile"
                className="flex items-center space-x-2 px-4 py-2 hover:bg-blue-100/50 dark:hover:bg-white/10 text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <User className="w-4 h-4" />
                <span>View Profile</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="border-blue-200/50 dark:border-white/10" />
            <DropdownMenuItem asChild>
              <Link
                href="/"
                className="flex items-center space-x-2 px-4 py-2 hover:bg-red-100/50 dark:hover:bg-red-500/20 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                onClick={logout}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
