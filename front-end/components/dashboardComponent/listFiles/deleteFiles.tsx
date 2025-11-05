import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteFileDialogProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  title: string; // The file title or name.
  loading: boolean; // Loading state for the delete button.
  deleteResult: string | null; // Result message (success or failure).
}

const DeleteFileDialog: React.FC<DeleteFileDialogProps> = ({
  open,
  onClose,
  onDelete,
  title,
  loading,
  deleteResult,
}) => {
  useEffect(() => {
    if (open) {
      // Clear any previous delete result when dialog is opened
      deleteResult = null;
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete File</DialogTitle>
        </DialogHeader>
        <p>
          Are you sure you want to delete the file <strong>{title}</strong>? This action cannot be undone.
        </p>
        {deleteResult && (
          <p
            className={`mt-2 ${
              deleteResult.includes("successfully")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {deleteResult}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            No
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={loading}>
            {loading ? "Deleting..." : "Yes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteFileDialog;
