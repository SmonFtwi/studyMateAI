"use client";

import { DashNavBar } from "@/components/dashboardComponent/navbar/dashNavbar";
import Sidebar from "@/components/dashboardComponent/sideBar";
import { AuthProvider } from "@/context/authContext";
import { CosmicBackground } from "@/components/LandingPage/CosmicBackground";
import { motion } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="relative min-h-screen bg-slate-50 dark:bg-[#030303] text-slate-900 dark:text-white overflow-hidden selection:bg-blue-500/30">
        <CosmicBackground />
        
        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none z-50 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]" />

        <div className="relative z-10 flex flex-col h-screen">
          <DashNavBar />
          
          <div className="flex flex-1 overflow-hidden p-4 pt-0 gap-4">
            {/* Sidebar with specialized container */}
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <Sidebar />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 relative glass-cosmos rounded-3xl border-white/5 overflow-hidden group/main">
              {/* Subtle background glow for main content */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none group-hover/main:bg-blue-500/20 transition-all duration-1000" />
              
              <div className="h-full overflow-y-auto custom-scrollbar p-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {children}
                </motion.div>
              </div>

              {/* Terminal-style corner accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-500/20 rounded-tl-3xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-blue-500/20 rounded-tr-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-blue-500/20 rounded-bl-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-blue-500/20 rounded-br-3xl pointer-events-none" />
            </main>
          </div>
        </div>

        {/* Floating background glows */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
    </AuthProvider>
  );
}

