import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface UpdateRoleDialogProps {
  open: boolean;
  onClose: () => void;
  currentRole: string;
  onUpdate: (newRole: string) => void | Promise<void>;
}

const UpdateRoleDialog: React.FC<UpdateRoleDialogProps> = ({
  open,
  onClose,
  currentRole,
  onUpdate,
}) => {
  const [selectedRole, setSelectedRole] = useState(currentRole);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (open) {
      setSelectedRole(currentRole);
      setError("");
    }
  }, [open, currentRole]);
  const handleUpdate = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await onUpdate(selectedRole);
      onClose();
    } catch {
      setError("The role couldn’t be updated. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => !busy && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update user role</DialogTitle>
          <DialogDescription>
            Choose the account’s access level.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger
              aria-label="User role"
              disabled={busy}
              className="w-full"
            >
              <span>{selectedRole}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="default"
            disabled={busy || !selectedRole}
            onClick={handleUpdate}
          >
            {busy ? "Updating…" : "Update role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateRoleDialog;
