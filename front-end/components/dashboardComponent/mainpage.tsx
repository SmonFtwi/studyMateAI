/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";

export default function MainPage() {
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const handleCreateProject = () => {
    if (!projectName.trim()) {
      alert("Please enter a project name.");
      return;
    }

    // You can replace this alert with an API call or navigation
    alert(
      `✅ Project "${projectName}" created!\nDescription: ${projectDescription}`
    );

    // Reset form and close modal
    setProjectName("");
    setProjectDescription("");
    setOpen(false);
  };

  return (
    <main className="flex flex-col h-[calc(100vh-100px)] items-center justify-center ">
      {/* Welcome Section */}
      <Avatar className="mb-6 rounded-full w-24 h-24">
        <AvatarImage src="/studyMate2.png" alt="Bot Avatar" />
      </Avatar>

      <h1 className="text-2xl font-bold">StudyMate AI</h1>
      <p className="text-gray-500 mt-3 mb-6 max-w-md">
        Start a new project to begin organizing your learning materials and
        ideas.
      </p>

      <Button
        onClick={() => setOpen(true)}
        className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl flex items-center gap-2"
      >
        <PlusCircle className="h-4 w-4" />
        New Project
      </Button>

      {/* Modal for Creating New Project */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a New Project</DialogTitle>
            <DialogDescription>
              Enter your project details below to get started.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Project Name
              </label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Description (optional)
              </label>
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Enter project description"
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
