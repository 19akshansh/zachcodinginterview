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
import { ReportDetailsClient } from "@/features/dashboard/reports/components/reportDetailsClient";
import { useDecideCandidate } from "../hooks/useRecruiters";

type ReviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interviewId: string;
  reportId: string;
  candidateName: string;
};

export const ReviewDialog = ({
  open,
  onOpenChange,
  interviewId,
  reportId,
  candidateName,
}: ReviewDialogProps) => {
  const [feedback, setFeedback] = React.useState("");
  const decide = useDecideCandidate();

  const handleDecide = (decision: "ACCEPTED" | "REJECTED") => {
    decide.mutate(
      { interviewId, decision, feedback: feedback.trim() || undefined },
      {
        onSuccess: () => {
          onOpenChange(false);
          setFeedback("");
        },
      },
    );
  };

  const decidingAs = decide.isPending ? decide.variables?.decision : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-w-3xl w-full max-h-[85vh] gap-0 overflow-hidden p-0"
      >
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Review {candidateName}&apos;s interview</DialogTitle>
          <DialogDescription>
            Read the full report, then decide whether this candidate moves
            forward.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[45vh] overflow-y-auto border-y bg-muted/20">
          {/* ReportDetailsClient already wraps itself in a Suspense + ErrorBoundary. */}
          <ReportDetailsClient reportId={reportId} />
        </div>

        <div className="flex flex-col gap-3 p-6">
          <Textarea
            placeholder="Optional feedback for your own records..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
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
              Not selected
            </Button>
            <Button
              type="button"
              disabled={decide.isPending}
              onClick={() => handleDecide("ACCEPTED")}
            >
              {decidingAs === "ACCEPTED" ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <CheckIcon className="size-4" />
              )}
              Select candidate
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
