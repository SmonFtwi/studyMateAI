"use client";
import { DashNavBar } from "@/components/dashboardComponent/navbar/dashNavbar";
import Sidebar from "@/components/dashboardComponent/sideBar";
//import Footer from "@/components/footer";
import { Card } from "@/components/ui/card";

import { AuthProvider } from "@/context/authContext";
import { useState, useEffect } from "react";

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthProvider>
        <div className="flex h-screen overflow-hidden gap-3 ">
          {/* Main Content */}
          <main
            className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out w-full 
            }`}
          >
            <div className="flex flex-col min-h-screen ">
              <DashNavBar />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 rounded-full blur-xl"></div>
              <div className="absolute bottom-1/3 left-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 rounded-full blur-lg"></div>

              <Card className="flex-grow rounded-md custom-bg ">
                {children}
              </Card>
            </div>
          </main>
        </div>
      </AuthProvider>
    </>
  );
}
