"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle } from "lucide-react";
import CreateProjectDialog from "./createProject";
import { createProject } from "@/lib/apicall/project";

export default function MainPage() {
  const [open, setOpen] = useState(false);

  const handleCreateProject = async (data: {
    name: string;
    description: string;
  }) => {
    const token = localStorage.getItem("token") as string;

    const res = await createProject(token, {
      title: data.name,
      description: data.description,
    });
    console.log("data", res);
    //onCreate(data);
    setOpen(false);
  };

  return (
    <main className="flex flex-col h-[calc(100vh-100px)] items-center justify-center">
      <Avatar className="mb-6 rounded-full w-24 h-24">
        <AvatarImage src="/studyMate2.png" alt="Bot Avatar" />
      </Avatar>

      <h1 className="text-2xl font-bold">StudyMate AI</h1>
      <p className="text-gray-500 mt-3 mb-6 max-w-md text-center">
        Start a new project to organize your learning materials and ideas.
      </p>

      <Button
        onClick={() => setOpen(true)}
        className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl flex items-center gap-2"
      >
        <PlusCircle className="h-4 w-4" />
        New Project
      </Button>

      <CreateProjectDialog
        open={open}
        onOpenChange={setOpen}
        onCreate={handleCreateProject}
      />
    </main>
  );
}
