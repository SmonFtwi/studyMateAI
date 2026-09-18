"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Folder,
  ChartNoAxesCombined,
  User,
  Users,
  UserCheck,
  Files,
  Menu,
  LogOut,
} from "lucide-react";
import Brand from "@/components/brand";
import { ModeToggle } from "@/components/theme-mode";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuthContext } from "@/context/authContext";
export function DashboardNavigation({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const path = usePathname();
  const { user, logout } = useAuthContext();
  const links = [
    { href: "/Dashboard", label: "Projects", icon: Folder },
    { href: "/Dashboard/Dash", label: "Analytics", icon: ChartNoAxesCombined },
    { href: "/Dashboard/profile", label: "Profile", icon: User },
  ];
  const admin = [
    { href: "/Dashboard/Manageusers", label: "Manage users", icon: Users },
    { href: "/Dashboard/users", label: "Pending approvals", icon: UserCheck },
    { href: "/Dashboard/listPdf", label: "Manage files", icon: Files },
  ];
  const render = (items: typeof links) =>
    items.map(({ href, label, icon: Icon }) => (
      <Link
        key={href}
        href={href}
        onClick={onNavigate}
        className="nav-link"
        aria-current={
          path === href ||
          (href === "/Dashboard" && path.includes("/projects/"))
            ? "page"
            : undefined
        }
      >
        <Icon size={18} />
        {label}
      </Link>
    ));
  return (
    <nav
      aria-label="Workspace navigation"
      className="flex h-full flex-col gap-1"
    >
      {render(links)}
      {user?.role === "admin" && (
        <>
          <p className="muted px-3 pt-8 pb-2 text-xs font-medium">
            Administration
          </p>
          {render(admin)}
        </>
      )}
      <div className="mt-auto pt-10">
        <div className="px-3 pb-3 text-sm truncate">
          {user?.username}
          <p className="muted text-xs truncate">{user?.email}</p>
        </div>
        <button className="nav-link w-full" onClick={logout}>
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </nav>
  );
}
export function DashNavBar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open workspace navigation"
              className="lg:hidden"
            >
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetTitle>Your workspace</SheetTitle>
            <SheetDescription>
              Projects, account, and study activity.
            </SheetDescription>
            <div className="mt-6 h-[calc(100%-5rem)]">
              <DashboardNavigation onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <Brand />
      </div>
      <div className="flex items-center gap-3">
        <span className="muted hidden sm:block text-sm">
          Your space to make sense of it all
        </span>
        <ModeToggle />
      </div>
    </header>
  );
}
