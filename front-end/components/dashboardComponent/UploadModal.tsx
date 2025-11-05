/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { uploadPDF } from "@/lib/apicall/pdfCall";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface UploadModalProps {
  onClose: () => void;
  onUpload: (fileNames: string[]) => void; // Pass uploaded file names to the parent component
}

interface UploadResult {
  filename: string;
  status: "success" | "failed";
  reason?: string; // Optional in case of failure
  message?: string; // Optional in case of success
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);

  const handleFileChange = (event: React.FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      const allowedTypes = [
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
      ];
      const validFiles = files.filter((file) => allowedTypes.includes(file.type));

      if (validFiles.length !== files.length) {
        alert("Some files are not valid. Only PDF, TXT, DOC, XLS, XLSX, and CSV files are allowed.");
      }

      setSelectedFiles(validFiles);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert("No files selected.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const token = localStorage.getItem("token") as string;
      const response: { results?: UploadResult[] } = await uploadPDF(token, formData);

      // Handle missing results gracefully
      const results = response.results || [];
      setUploadResults(results);

      const failedFiles = results.filter((result) => result.status === "failed");
      const successfulFiles = results.filter((result) => result.status === "success");

      if (failedFiles.length > 0) {
        alert(
          `The following files failed to process: ${failedFiles
            .map((f) => `${f.filename}: ${f.reason || "Unknown error"}`)
            .join(", ")}`
        );
      }else {
        onClose();
      }

      // if (successfulFiles.length > 0) {
      //   alert(`Successfully uploaded: ${successfulFiles.map((f) => f.filename).join(", ")}`);
      // }

      // Notify parent about successfully uploaded files
      onUpload(successfulFiles.map((result) => result.filename));
    } catch (error: any) {
      console.error("Error uploading files:", error);
      alert(error?.message || "Failed to upload the files. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0">
          <Input
            type="file"
            accept=".txt,.doc,.docx,.pdf,.xls,.xlsx,.csv"
            multiple
            onChange={handleFileChange}
          />
           {selectedFiles.length > 0 && (
          <div className="flex-1 min-h-0 text-sm text-gray-500 dark:text-gray-300">
            <p className="mb-2">Selected files:</p>
            <div className="max-h-[40vh] overflow-y-auto px-5 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-zinc-600 rounded-lg border border-gray-200 dark:border-gray-700">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {selectedFiles.map((file, index) => (
                  <li 
                    key={index} 
                    className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      {file.name}
                    </li>
                
              ))}
              </ul>
                </div>
          </div>
        )}

          
        </div>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading && <Loader2 className="animate-spin mr-2" />}
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
        {uploadResults.length > 0 && (
            <div className="mt-10">
              <h3>Upload Results</h3>
               <div className="max-h-[40vh] overflow-y-auto px-5 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-zinc-600 rounded-lg border border-gray-200 dark:border-gray-700">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {uploadResults.map((result, index) => (
                  <li
                    key={index}
                    className={`px-4 py-2 ${
                      result.status === "success" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {result.filename} - {result.status === "success" ? result.message : result.reason}
                  </li>
                ))}
              </ul>
              </div>
            </div>
          )}
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;
