/* eslint-disable @typescript-eslint/no-unused-vars */

import { ModeToggle } from "@/components/theme-mode";
import { Suspense } from "react";

import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import MainPage from "@/components/dashboardComponent/mainpage";

export default function Page() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <MainPage />
      </Suspense>
    </>
  );
}
