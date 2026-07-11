"use client";

import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import Link from "next/link";
import { ChevronRight, Loader2Icon, AlertTriangleIcon } from "lucide-react";
import { useSuspenseInterview } from "../hooks/useInterviews";
import { InterviewStartScreen } from "./interviewStartScreen";
import { InterviewSessionActive } from "./interviewSessionActive";
import { InterviewCompletedScreen } from "./interviewCompletedScreen";
import { InterviewAbandonedScreen } from "./interviewAbandonedScreen";

const InterviewSessionData = ({ interviewId }: { interviewId: string }) => {
  const { data: interview } = useSuspenseInterview(interviewId);

  return (
    <div className="p-4 md:px-10 md:py-6 h-full flex flex-col gap-y-6 max-w-screen-xl mx-auto w-full min-h-0">
      <div className="flex items-center text-xs text-muted-foreground gap-2">
        <Link
          href="/interviews"
          className="hover:text-foreground transition-colors"
        >
          Interviews
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground">{interview.title || "Session"}</span>
      </div>

      {interview.status === "SCHEDULED" && (
        <InterviewStartScreen interview={interview} />
      )}
      {interview.status === "IN_PROGRESS" && (
        <InterviewSessionActive interview={interview} />
      )}
      {interview.status === "COMPLETED" && (
        <InterviewCompletedScreen interview={interview} />
      )}
      {interview.status === "ABANDONED" && <InterviewAbandonedScreen />}
    </div>
  );
};

export const InterviewSessionLoading = () => (
  <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground h-full min-h-[50vh]">
    <Loader2Icon className="size-4 animate-spin" />
    Loading your interview session...
  </div>
);

export const InterviewSessionError = () => (
  <div className="flex flex-1 flex-col items-center justify-center gap-2 text-sm text-muted-foreground h-full min-h-[50vh]">
    <AlertTriangleIcon className="size-6 text-destructive" />
    Something went wrong loading this interview. Please try again.
  </div>
);

export const InterviewDetailsClient = ({
  interviewId,
}: {
  interviewId: string;
}) => {
  return (
    <ErrorBoundary fallback={<InterviewSessionError />}>
      <React.Suspense fallback={<InterviewSessionLoading />}>
        <InterviewSessionData interviewId={interviewId} />
      </React.Suspense>
    </ErrorBoundary>
  );
};
