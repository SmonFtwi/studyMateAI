"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import Brand from "./brand";
import { Button } from "./ui/button";
import { ModeToggle } from "./theme-mode";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "./ui/sheet";
const links = [
  ["Features", "/#capabilities"],
  ["How it works", "/#how-it-works"],
  ["About", "/about"],
];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="border-b">
      <nav
        aria-label="Main navigation"
        className="page-width flex h-20 items-center justify-between gap-4"
      >
        <Brand />
        <div className="hidden md:flex gap-6 text-sm muted">
          {links.map(([name, href]) => (
            <Link className="hover:text-blue-500" key={name} href={href}>
              {name}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/register">Get started</Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open navigation"
              >
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetTitle>StudyMate</SheetTitle>
              <SheetDescription>Explore your study companion.</SheetDescription>
              <div className="mt-8 space-y-3">
                {[
                  ...links,
                  ["Sign in", "/login"],
                  ["Get started", "/register"],
                ].map(([name, href]) => (
                  <Link
                    key={name}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="nav-link"
                  >
                    {name}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
