"use client";

import {
  CalendarIcon,
  EyeIcon,
  EyeOffIcon,
  FileTextIcon,
  TrophyIcon,
} from "lucide-react";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  EntityItem,
  ErrorView,
} from "@/components/layout/shared/entityComponents";
import { RelativeTime } from "@/components/layout/shared/relativeTime";
import { Badge } from "@/components/ui/badge";
import { useDeleteResume, useSuspenseMyResume } from "../hooks/useResume";
import { ResumeUploadZone } from "./resumeUploadZone";

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

type ResumeData = ReturnType<typeof useSuspenseMyResume>["data"];

const ResumeCard = ({ resume }: { resume: NonNullable<ResumeData> }) => {
  const deleteResume = useDeleteResume();

  return (
    <EntityItem
      href={`/resume/${resume.id}`}
      title={resume.fileName}
      subtitle={
        <div className="flex flex-col gap-1.5 mt-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
              {formatFileSize(resume.fileSize)}
            </Badge>
            {resume.feedback && (
              <>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <TrophyIcon className="size-3" />
                  ATS {resume.feedback.atsScore}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50">
            <span className="flex items-center gap-1">
              <CalendarIcon className="size-3" />
              Updated <RelativeTime date={resume.updatedAt} />
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              {resume.visibleToRecruiters ? (
                <EyeIcon className="size-3" />
              ) : (
                <EyeOffIcon className="size-3" />
              )}
              {resume.visibleToRecruiters
                ? "Visible to recruiters"
                : "Hidden from recruiters"}
            </span>
          </div>
        </div>
      }
      image={
        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-all duration-200">
          <FileTextIcon className="size-5 text-primary" />
        </div>
      }
      onRemove={() => deleteResume.mutate()}
      isRemoving={deleteResume.isPending}
    />
  );
};

const ResumeData = () => {
  const { data: resume } = useSuspenseMyResume();

  if (!resume) {
    return <ResumeUploadZone variant="empty" />;
  }

  return (
    <div className="flex flex-col gap-y-4">
      <ResumeCard resume={resume} />
      <ResumeUploadZone variant="replace" />
    </div>
  );
};

export const ResumeHeader = () => (
  <div className="flex flex-col">
    <h1 className="text-lg md:text-xl font-semibold">Resume</h1>
    <p className="text-sm text-muted-foreground">
      Upload your resume for AI feedback, and to unlock resume-based &
      domain-specific interviews.
    </p>
  </div>
);

const ResumePage = () => (
  <div className="p-4 md:px-10 md:py-6 h-full">
    <div className="mx-auto max-w-screen-xl w-full flex flex-col gap-y-8 h-full">
      <ResumeHeader />
      <ResumeData />
    </div>
  </div>
);

export const ResumeContainer = () => {
  return (
    <React.Suspense fallback={<ResumeLoading />}>
      <ResumePage />
    </React.Suspense>
  );
};

export const ResumeLoading = () => (
  <div className="p-4 md:px-10 md:py-6 h-full">
    <div className="mx-auto max-w-screen-xl w-full flex flex-col gap-y-8 h-full">
      <ResumeHeader />
      <div className="flex justify-center items-center flex-1 min-h-[200px]">
        <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    </div>
  </div>
);

export const ResumeError = () => (
  <ErrorView message="Failed to load your resume. Please try again." />
);
