/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Send, PlusCircle } from "lucide-react";
import { useAuthContext } from "@/context/authContext";

const WelcomeCard = ({ onNewProject }: { onNewProject: () => void }) => (
  <div className="shadow-none flex flex-col items-center justify-center text-center p-3 border-none">
    <div className="mb-6">
      <Avatar>
        <AvatarImage src="/studyMate2.png" alt="Bot Avatar" />
      </Avatar>
    </div>
    <h1 className="text-2xl font-bold">StudyMate AI</h1>
    <p className="text-gray-500 mt-4">
      Start a new project to begin working with StudyMate.
    </p>
    <Button
      onClick={onNewProject}
      className="mt-6 bg-blue-600 text-white hover:bg-blue-700 rounded-xl flex items-center gap-2"
    >
      <PlusCircle className="h-4 w-4" />
      New Project
    </Button>
  </div>
);

export default function Chatbot() {
  const [userInput, setUserInput] = useState("");
  const { user } = useAuthContext();

  const handleNewProject = () => {
    const projectName = prompt("Enter a name for your new project:");
    if (projectName && projectName.trim()) {
      alert(`✅ Project "${projectName}" created successfully!`);
      // You can later replace this alert with your API call or navigation
    } else {
      alert("Project name cannot be empty.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    alert(`Message sent: ${userInput}`);
    setUserInput("");
  };

  return (
    <main className="flex flex-col h-[calc(100vh-100px)] bg-transparent">
      {/* Center content */}
      <div className="flex-1 flex items-center justify-center">
        <WelcomeCard onNewProject={handleNewProject} />
      </div>

      {/* Input Section */}
      <div className="sticky bottom-0 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <Card className="backdrop-blur-sm rounded-2xl px-3 py-2.5 bg-zinc-200 dark:bg-zinc-800">
            <div className="flex items-center gap-3 mb-2">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Start typing..."
                className="flex-1 bg-transparent border-0 focus:ring-0 focus-visible:ring-0 focus:outline-none"
              />
              <Button
                type="submit"
                variant="ghost"
                className="h-8 w-8 rounded-lg p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </main>
  );
}
