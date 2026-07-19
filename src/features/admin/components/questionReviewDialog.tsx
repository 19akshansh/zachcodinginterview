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
import { useDecideQuestionApproval } from "../hooks/useAdmin";

type QuestionReviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionId: string;
  title: string;
  prompt: string;
  topics: string[];
};

export const QuestionReviewDialog = ({
  open,
  onOpenChange,
  questionId,
  title,
  prompt,
  topics,
}: QuestionReviewDialogProps) => {
  const [reviewNote, setReviewNote] = React.useState("");
  const decide = useDecideQuestionApproval();

  const handleDecide = (decision: "APPROVED" | "REJECTED") => {
    decide.mutate(
      { id: questionId, decision, reviewNote: reviewNote.trim() || undefined },
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
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            This note is shown to the recruiter in-app and is not emailed.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[35vh] overflow-y-auto rounded-lg border bg-muted/20 p-3 text-sm whitespace-pre-wrap break-words">
          {prompt}
        </div>

        {topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topics.map((topic) => (
              <span
                key={topic}
                className="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        <Textarea
          placeholder="Optional feedback for the recruiter..."
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
