import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  return (
    <Dialog open={open} onOpenChange={() => !loading && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete File</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete the file <strong>{title}</strong>?
          This action cannot be undone.
        </DialogDescription>
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
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete file"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteFileDialog;
