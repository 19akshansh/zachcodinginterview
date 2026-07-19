"use client";

import { CheckIcon, Loader2Icon, XIcon } from "lucide-react";
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
import { useDecideApplication } from "../hooks/useAdmin";

type ApplicationReviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  applicantName: string;
  description: string;
};

export const ApplicationReviewDialog = ({
  open,
  onOpenChange,
  applicationId,
  applicantName,
  description,
}: ApplicationReviewDialogProps) => {
  const [reviewNote, setReviewNote] = React.useState("");
  const decide = useDecideApplication();

  const handleDecide = (decision: "APPROVED" | "REJECTED") => {
    decide.mutate(
      {
        applicationId,
        decision,
        reviewNote: reviewNote.trim() || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setReviewNote("");
        },
      },
    );
  };

  const decidingAs = decide.isPending ? decide.variables?.decision : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full gap-4">
        <DialogHeader>
          <DialogTitle>{applicantName}&apos;s application</DialogTitle>
          <DialogDescription>
            This note will be emailed to the applicant.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[30vh] overflow-y-auto rounded-lg border bg-muted/20 p-3 text-sm whitespace-pre-wrap break-words">
          {description}
        </div>

        <Textarea
          placeholder="Optional note for the applicant..."
          value={reviewNote}
          onChange={(e) => setReviewNote(e.target.value)}
          rows={3}
          disabled={decide.isPending}
        />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={decide.isPending}
            onClick={() => handleDecide("REJECTED")}
          >
            {decidingAs === "REJECTED" ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <XIcon className="size-4" />
            )}
            Reject
          </Button>
          <Button
            type="button"
            disabled={decide.isPending}
            onClick={() => handleDecide("APPROVED")}
          >
            {decidingAs === "APPROVED" ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <CheckIcon className="size-4" />
            )}
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
