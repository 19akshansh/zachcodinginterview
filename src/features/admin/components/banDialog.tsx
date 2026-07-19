"use client";

import { Loader2Icon, ShieldBanIcon, ShieldCheckIcon } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useBanUser } from "../hooks/useAdmin";

type BanDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  isCurrentlyBanned: boolean;
};

export const BanDialog = ({
  open,
  onOpenChange,
  userId,
  userName,
  isCurrentlyBanned,
}: BanDialogProps) => {
  const [reason, setReason] = React.useState("");
  const banUser = useBanUser();

  const willBan = !isCurrentlyBanned;
  const canSubmit = !willBan || reason.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;

    banUser.mutate(
      { userId, banned: willBan, reason: reason.trim() || undefined },
      {
        onSuccess: () => {
          onOpenChange(false);
          setReason("");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>
            {willBan ? `Suspend ${userName}?` : `Reinstate ${userName}?`}
          </DialogTitle>
          <DialogDescription>
            {willBan
              ? "They'll be emailed and won't be able to sign in until you reinstate them."
              : "They'll be emailed and will be able to sign in again immediately."}
          </DialogDescription>
        </DialogHeader>

        {willBan && (
          <Textarea
            placeholder="Reason for suspension (required, shown to the user)..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            disabled={banUser.isPending}
          />
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={banUser.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={willBan ? "destructive" : "default"}
            disabled={!canSubmit || banUser.isPending}
            onClick={handleSubmit}
          >
            {banUser.isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : willBan ? (
              <ShieldBanIcon className="size-4" />
            ) : (
              <ShieldCheckIcon className="size-4" />
            )}
            {willBan ? "Suspend" : "Reinstate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
