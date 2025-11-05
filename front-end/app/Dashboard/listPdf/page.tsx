/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { listPDFs, deletePDF } from "@/lib/apicall/pdfCall";
import UploadModal from "@/components/dashboardComponent/UploadModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, PlusCircle, Search, SortAsc, SortDesc, Download } from "lucide-react";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tooltip } from "@radix-ui/react-tooltip";
import { format, isToday, isThisWeek, isThisMonth, parseISO } from "date-fns";
import DeleteFileDialog from "@/components/dashboardComponent/listFiles/deleteFiles";

interface FileData {
  file_id: number;
  title: string;
  uploaded_at: string;
  file_url: string;
  username: string;
}

type SortField = "date" | "name";
type SortDirection = "asc" | "desc";

interface GroupedFiles {
  today: FileData[];
  thisWeek: FileData[];
  thisMonth: FileData[];
  older: FileData[];
}

const PDFManager: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isDownloading, setIsDownloading] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [fileToDelete, setFileToDelete] = useState<FileData | null>(null);
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [deleted, setdeleted] = useState<boolean>(false);
  const [loading, setloading] = useState<boolean>(false);
  const [deleteResult, setDeleteResult] = useState<string | null>(null); 


  useEffect(() => {
    fetchFiles();
  }, [currentPage, searchQuery, deleted]);

  const fetchFiles = async () => {
    try {
      const { files: fetchedFiles, total } = await listPDFs(currentPage, searchQuery);
      setFiles(fetchedFiles);
      setTotalFiles(total);
    } catch (error) {
      console.error("Error fetching files:", error);
      setFiles([]);
    }
  };

  const handleDeleteConfirmation = (file: FileData) => {
    setFileToDelete(file);
    setDeleteResult(null); // Clear the previous message when opening the dialog
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!fileToDelete) return;
    setloading(true);
    try {
      const token = await localStorage.getItem("token") as string;
      await deletePDF(fileToDelete.file_id, token);
      setFiles((prevFiles) => prevFiles.filter((file) => file.file_id !== fileToDelete.file_id));
      setDeleteResult(`File "${fileToDelete.title}" deleted successfully.`);
      setloading(false);
    } catch (error) {
      setDeleteResult(`Failed to delete file "${fileToDelete.title}".`);
      console.error("Error deleting file:", error);
      setloading(false);
    } finally {
      setloading(false);
      setTimeout(() => setIsDeleteDialogOpen(false), 2000); // Auto-close dialog after 2 seconds
    }
  };


  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to the first page for new search
  };

  const handlePagination = (page: number) => {
    setCurrentPage(page);
  };

  const handleDownload = async (file: FileData) => {
    setIsDownloading(file.file_id);
    try {
      const response = await fetch(file.file_url);

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const blob = await response.blob();

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element
      const link = document.createElement("a");
      link.href = url;

      // Set the filename
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : file.title;
      link.download = filename;

      // Append to document, click, and cleanup
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup the URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(null);
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleUploadSuccess = () => {
    fetchFiles();
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  

  // Pagination Controls
  const totalPages = Math.ceil(totalFiles / 100);
  const PaginationControls = () => (
    <div className="flex justify-between items-center mt-4">
      <Button
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => handlePagination(currentPage - 1)}
      >
        Previous
      </Button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        disabled={currentPage === totalPages}
        onClick={() => handlePagination(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  );

  // Filter and sort files
  const processedFiles = useMemo(() => {
    let filtered = [...files];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((file) =>
        file.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === "date") {
        comparison = new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
      } else if (sortField === "name") {
        comparison = a.title.localeCompare(b.title);
      }
      return sortDirection === "asc" ? -comparison : comparison;
    });

    return filtered;
  }, [files, searchQuery, sortField, sortDirection]);

  const groupedFiles = useMemo(() => {
    const groups: GroupedFiles = {
      today: [],
      thisWeek: [],
      thisMonth: [],
      older: [],
    };
  
    processedFiles.forEach((file) => {
      const date = parseISO(file.uploaded_at);
      if (isToday(date)) {
        groups.today.push(file);
      } else if (isThisWeek(date)) {
        groups.thisWeek.push(file);
      } else if (isThisMonth(date)) {
        groups.thisMonth.push(file);
      } else {
        groups.older.push(file);
      }
    });
  
    return groups;
  }, [processedFiles]);


  const FileGroup: React.FC<{ title: string; files: FileData[] }> = ({ title, files }) => {
    if (files.length === 0) return null;

    return (
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-500 mb-2">{title}</h2>
        <Card className="divide-y bg-transparent">
          {files.map((file) => (
            <div
              key={file.file_id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 py-3 px-4 sm:py-4 sm:px-6"
            >
              <div className="flex flex-col">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-sm sm:text-base break-all">
                        {file.title.length > 40 ? `${file.title.substring(0, 40)}...` : file.title}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{file.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <span className="text-sm my-1">Uploaded by: {file.username}</span>
                <span className="text-xs text-gray-500">
                  {format(parseISO(file.uploaded_at), "MMM d, yyyy h:mm a")}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none text-xs sm:text-sm"
                  onClick={() => handleDownload(file)}
                  disabled={isDownloading === file.file_id}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isDownloading === file.file_id ? "Downloading..." : "Download"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 sm:flex-none text-xs sm:text-sm text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDeleteConfirmation(file)}
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </div>
          ))}
        </Card>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 w-full mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Data source manager</h1>
        <Button
          variant="outline"
          onClick={toggleModal}
          className="w-full sm:w-auto flex items-center justify-center"
        >
          <PlusCircle className="mr-2 w-5 h-5" />
          Add New File
        </Button>
      </div>

      {/* Search and Sort Section */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="default"
            onClick={() => toggleSort("date")}
            className={`flex items-center gap-2 ${sortField === "date" ? "bg-gray-100" : ""}`}
          >
            Date
            {sortField === "date" &&
              (sortDirection === "asc" ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              ))}
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={() => toggleSort("name")}
            className={`flex items-center gap-2 ${sortField === "name" ? "bg-gray-100" : ""}`}
          >
            Name
            {sortField === "name" &&
              (sortDirection === "asc" ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              ))}
          </Button>
        </div>
      </div>

      {/* File List Section */}
      {processedFiles.length > 0 ? (
        <>
          <FileGroup title="Today" files={groupedFiles.today} />
          <FileGroup title="This Week" files={groupedFiles.thisWeek} />
          <FileGroup title="This Month" files={groupedFiles.thisMonth} />
          <FileGroup title="Older" files={groupedFiles.older} />
          <PaginationControls />
        </>
      ) : (
        <Card className="py-8 px-4 text-center text-gray-500">
          <p className="text-sm sm:text-base">
            {searchQuery ? "No files match your search." : "No files uploaded yet."}
          </p>
          <p className="text-xs sm:text-sm mt-2 text-gray-400">
            {searchQuery ? "Try adjusting your search terms." : "Click Add New File to upload your first document"}
          </p>
        </Card>
      )}

      {/* Upload Modal */}
      {isModalOpen && <UploadModal onClose={toggleModal} onUpload={handleUploadSuccess} />}

      {/* Delete File Dialog */}
      {isDeleteDialogOpen && (
        <DeleteFileDialog
          open={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onDelete={handleDelete}
          title={fileToDelete?.title ?? ""}
          loading={loading}
          deleteResult={deleteResult}
        />
      )}
    </div>
  );
};

export default PDFManager;
