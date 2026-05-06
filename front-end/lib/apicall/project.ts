export const createProject = async (token: string, projectData: any) => {
  console.log("projectData", projectData);
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_backend_url}/projects/createProject`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(projectData),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to create project");
  }
  const data = await response.json();
  return data;
};

export const getProjects = async (token: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_backend_url}/projects/getProjects`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to get projects");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in getProjects:", error);
    throw error;
  }
};

export const deleteProject = async (token: string, project_id: string) => {
  console.log("project_id", project_id);
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_backend_url}/projects/deleteProject/${project_id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to delete project");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in deleteProject:", error);
    throw error;
  }
};

export const uploadProjectSources = async (
  token: string,
  projectId: string,
  files: File[]
) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_backend_url}/projects/${projectId}/sources`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText || "Failed to upload sources. Please try again later."
    );
  }

  return response.json();
};

export const getProjectFiles = async (token: string, projectId: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_backend_url}/projects/${projectId}/files`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to fetch project files");
  }

  return response.json();
};

export const createChatSession = async (
  token: string,
  projectId: string,
  title?: string
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_backend_url}/projects/${projectId}/chat/sessions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    }
  );
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to create chat session");
  }
  return response.json();
};

export const getChatSessions = async (token: string, projectId: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_backend_url}/projects/${projectId}/chat/sessions`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to fetch chat sessions");
  }
  return response.json();
};

export const getChatMessages = async (
  token: string,
  projectId: string,
  sessionId: string
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_backend_url}/projects/${projectId}/chat/${sessionId}/messages`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to fetch chat messages");
  }
  return response.json();
};

export const sendChatMessage = async (
  token: string,
  projectId: string,
  sessionId: string,
  message: string
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_backend_url}/projects/${projectId}/chat/${sessionId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    }
  );
  if (!response.ok) {
    const messageText = await response.text();
    throw new Error(messageText || "Failed to send chat message");
  }
  return response.json();
};

export const generateFlashcards = async (token: string, projectId: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_backend_url}/projects/${projectId}/flashcards/generate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to generate flashcards");
  }
  return response.json();
};

export const getFlashcards = async (token: string, projectId: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_backend_url}/projects/${projectId}/flashcards`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to fetch flashcards");
  }
  return response.json();
};

export const generateQuiz = async (token: string, projectId: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_backend_url}/projects/${projectId}/quiz/generate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to generate quiz");
  }
  return response.json();
};

export const getQuiz = async (token: string, projectId: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_backend_url}/projects/${projectId}/quiz`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to fetch quiz");
  }
  return response.json();
};
