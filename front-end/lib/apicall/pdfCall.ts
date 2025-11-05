/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE_URL = process.env.NEXT_PUBLIC_backend_url;

interface FileData {
  file_id: number;        // The unique identifier of the file
  title: string;          // The name of the file
  uploaded_at: string;    // The timestamp of when the file was uploaded
  file_url: string;       // The URL to access the file
  username: string;       // The username of the user who uploaded the file
}

export const listPDFs = async (
  page: number,
  searchQuery: string
): Promise<{ files: FileData[]; total: number }> => {
  const response = await fetch(
    `${API_BASE_URL}/pdf/list?page=${page}&limit=100&search=${encodeURIComponent(
      searchQuery
    )}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    console.log("Error fetching files:", response);
    throw new Error("Failed to fetch the list of files.");
  }

  const data = await response.json();

  if (!Array.isArray(data.files)) {
    throw new Error("Invalid data format received from server.");
  }

  return { files: data.files, total: data.total };
};



interface UploadResult {
  filename: string;
  status: "success" | "failed";
  reason?: string; // Optional in case of failure
  message?: string; // Optional in case of success
}

export const uploadPDF = async (token:string, formData: FormData): Promise<{ results?: UploadResult[] }> => {


  const response = await fetch(`${API_BASE_URL}/pdf/upload`, {
    method: "POST",
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  if (!response.ok) {
    console.log("erorr", response)
    throw new Error("Failed to upload the file.");
  }
  const data = await response.json();
  return data;
};

export const deletePDF = async (file_id:any, token:string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/pdf/delete`, {
    method: "POST",
    headers: {
      'Authorization': `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ file_id }),
    
  });
  if (!response.ok) {
    throw new Error("Failed to delete the file.");
  }
};
