import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-6 text-center text-sm text-white/60 bg-[#0b0e17]">
      © {new Date().getFullYear()} StudyMate. All rights reserved.
    </footer>
  );
}
