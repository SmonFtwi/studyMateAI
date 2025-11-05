import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
      © {new Date().getFullYear()} StudyMate. All rights reserved.
    </footer>
  );
}
