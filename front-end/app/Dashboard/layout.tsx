"use client";
import {
  DashNavBar,
  DashboardNavigation,
} from "@/components/dashboardComponent/navbar/dashNavbar";
import { AuthProvider } from "@/context/authContext";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex min-h-dvh flex-col">
        <DashNavBar />
        <div className="flex flex-1">
          <aside className="hidden lg:block w-56 shrink-0 border-r p-4">
            <div className="sticky top-4 h-[calc(100dvh-7rem)]">
              <DashboardNavigation />
            </div>
          </aside>
          <main id="main-content" className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
