"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // To prevent hydration mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      className="relative flex items-center justify-between w-16 h-8 px-1 bg-gray-200 dark:bg-gray-800 rounded-full shadow-inner"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Toggle theme"
    >
      <span
        className={`absolute w-6 h-6 bg-white rounded-full shadow transition-transform ${
          theme === "dark" ? "translate-x-8" : "translate-x-0"
        }`}
      />
      <span className="w-6 h-6 flex items-center justify-center text-gray-500 dark:text-gray-400">
        🌙
      </span>
      <span className="w-6 h-6 flex items-center justify-center text-gray-500 dark:text-gray-400">
        ☀️
      </span>
    </button>
  );
}
