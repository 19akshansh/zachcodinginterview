"use client";

import {
  AlertTriangleIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  FileTextIcon,
  Loader2Icon,
  RefreshCwIcon,
  SparklesIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  TrophyIcon,
} from "lucide-react";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { RelativeTime } from "@/components/layout/shared/relativeTime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbsLabel";
import {
  useGenerateResumeFeedback,
  useSuspenseResume,
  useToggleResumeVisibility,
} from "../hooks/useResume";
import { toast } from "sonner";

type ResumeData = ReturnType<typeof useSuspenseResume>["data"];

const SECTION_LABELS: Record<string, string> = {
  formatting: "Formatting",
  impact: "Impact",
  keywords: "Keywords",
  clarity: "Clarity",
};

const scoreColor = (score: number) => {
  if (score >= 80) return "bg-primary";
  if (score >= 60) return "bg-orange-500";
  return "bg-red-500";
};

const ScoreBar = ({ label, score }: { label: string; score: number }) => {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums">{score}</span>
      </div>
      <Progress value={score}>
        <ProgressTrack>
          <ProgressIndicator className={scoreColor(score)} />
        </ProgressTrack>
      </Progress>
    </div>
  );
};

const ResumeFeedbackSection = ({ resume }: { resume: ResumeData }) => {
  const generateFeedback = useGenerateResumeFeedback();

  if (!resume) {
    toast.error("Something went wrong. Please try again.");
    return null;
  }

  const feedback = resume.feedback;

  if (!feedback) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-10 text-center">
          <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <SparklesIcon className="size-6 text-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">
              Get AI feedback on your resume
            </p>
            <p className="text-xs text-muted-foreground max-w-sm">
              We'll score your resume like an ATS and a human reviewer would,
              and point out what to fix.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={generateFeedback.isPending}
              disabled={generateFeedback.isPending}
              onCheckedChange={(checked) => {
                if (checked) generateFeedback.mutate();
              }}
            />
            <span className="text-sm font-medium">
              {generateFeedback.isPending
                ? "Generating feedback..."
                : "Get Feedback"}
            </span>
            {generateFeedback.isPending && (
              <Loader2Icon className="size-4 animate-spin text-primary" />
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const sectionScores =
    (feedback.sectionScores as Record<string, number> | null) ?? {};
  const sectionEntries = Object.entries(sectionScores);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-1">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
              <TrophyIcon className="size-6 text-primary" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-3xl font-black tabular-nums text-primary">
                {feedback.atsScore}
                <span className="text-sm font-medium text-muted-foreground">
                  / 100 ATS score
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xl">
                {feedback.summary}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            disabled={generateFeedback.isPending}
            onClick={() => generateFeedback.mutate()}
          >
            {generateFeedback.isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <RefreshCwIcon className="size-4" />
            )}
            Regenerate Feedback
          </Button>
        </CardContent>
      </Card>

      {sectionEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {sectionEntries.map(([key, score]) => (
              <ScoreBar
                key={key}
                label={SECTION_LABELS[key] ?? key}
                score={score}
              />
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {feedback.strengths.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThumbsUpIcon className="size-4 text-primary" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-3">
                {feedback.strengths.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2Icon className="size-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {feedback.weaknesses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThumbsDownIcon className="size-4 text-orange-500" />
                Weaknesses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-3">
                {feedback.weaknesses.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <AlertTriangleIcon className="size-4 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {feedback.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SparklesIcon className="size-4 text-primary" />
              Suggestions for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {feedback.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
                  <span className="text-muted-foreground">{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const ResumeDetailsData = ({ resumeId }: { resumeId: string }) => {
  const { data: resume } = useSuspenseResume(resumeId);
  const toggleVisibility = useToggleResumeVisibility();

  if (!resume) {
    toast.error("Something went wrong. Please try again.");
    return null;
  }

  useBreadcrumbLabel(resumeId, resume.fileName);

  return (
    <div className="p-4 md:px-10 md:py-6 h-full flex flex-col gap-y-6 max-w-screen-xl mx-auto w-full">
      <Card>
        <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-1">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
              <FileTextIcon className="size-6 text-primary" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-lg md:text-xl font-semibold">
                {resume.fileName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-[10px]">
                  PDF
                </Badge>
                <span className="flex items-center gap-1">
                  <CalendarIcon className="size-3" />
                  Uploaded <RelativeTime date={resume.createdAt} />
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            nativeButton={false}
            render={
              <a
                href={resume.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <ExternalLinkIcon className="size-4" />
            View Resume
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between gap-4 pt-1">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium">Recruiter Visibility</p>
            <p className="text-xs text-muted-foreground">
              Allow recruiters and admins to see this resume and its feedback.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {toggleVisibility.isPending && (
              <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
            )}
            <Switch
              checked={resume.visibleToRecruiters}
              disabled={toggleVisibility.isPending}
              onCheckedChange={(checked) =>
                toggleVisibility.mutate({ visibleToRecruiters: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <ResumeFeedbackSection resume={resume} />
    </div>
  );
};

export const ResumeDetailsLoading = () => (
  <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground h-full min-h-[50vh]">
    <Loader2Icon className="size-4 animate-spin" />
    Loading resume...
  </div>
);

export const ResumeDetailsError = () => (
  <div className="flex flex-1 flex-col items-center justify-center gap-2 text-sm text-muted-foreground h-full min-h-[50vh]">
    <AlertTriangleIcon className="size-6 text-destructive" />
    Something went wrong loading this resume. Please try again.
  </div>
);

export const ResumeDetailsClient = ({ resumeId }: { resumeId: string }) => {
  return (
    <ErrorBoundary fallback={<ResumeDetailsError />}>
      <React.Suspense fallback={<ResumeDetailsLoading />}>
        <ResumeDetailsData resumeId={resumeId} />
      </React.Suspense>
    </ErrorBoundary>
  );
};
