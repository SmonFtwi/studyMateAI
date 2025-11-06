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
