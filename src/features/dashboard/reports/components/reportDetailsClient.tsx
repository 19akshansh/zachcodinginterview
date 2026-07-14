"use client";

import {
  AlertTriangleIcon,
  DownloadIcon,
  FileTextIcon,
  Loader2,
  Loader2Icon,
  LightbulbIcon,
  TrophyIcon,
  UserIcon,
} from "lucide-react";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { RelativeTime } from "@/components/relativeTime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Progress,
  ProgressTrack,
  ProgressIndicator,
} from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { INTERVIEW_TYPE_LABELS, VERDICT_LABELS, Verdict } from "@/config/enums";
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbsLabel";
import { useExportReport, useSuspenseReport } from "../hooks/useReports";

type ReportData = ReturnType<typeof useSuspenseReport>["data"];

const VERDICT_STYLES: Record<string, string> = {
  [Verdict.STRONG_HIRE]: "bg-primary/10 text-primary border-primary/20",
  [Verdict.HIRE]: "bg-primary/10 text-primary border-primary/20",
  [Verdict.LEAN_HIRE]: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  [Verdict.NO_HIRE]: "bg-red-500/10 text-red-500 border-red-500/20",
  [Verdict.STRONG_NO_HIRE]: "bg-red-500/10 text-red-500 border-red-500/20",
};

const SCORE_FIELDS: { key: keyof ReportData; label: string }[] = [
  { key: "communication", label: "Communication" },
  { key: "problemSolving", label: "Problem Solving" },
  { key: "codeQuality", label: "Code Quality" },
  { key: "optimization", label: "Optimization" },
  { key: "cleanliness", label: "Cleanliness" },
  { key: "confidence", label: "Confidence" },
];

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

const ReportDetailsData = ({ reportId }: { reportId: string }) => {
  const { data: report } = useSuspenseReport(reportId);
  const exportReport = useExportReport();

  const interview = report.interview;
  const firstQuestion = interview?.questions?.[0]?.question;
  const title = interview?.title || firstQuestion?.title || "Interview Report";
  const typeLabel = interview?.type
    ? INTERVIEW_TYPE_LABELS[
        interview.type as keyof typeof INTERVIEW_TYPE_LABELS
      ]
    : null;
  const candidateName = interview?.candidate?.name;

  useBreadcrumbLabel(reportId, title);

  const scoreEntries = SCORE_FIELDS.map(({ key, label }) => ({
    label,
    score: report[key] as number | null,
  })).filter(
    (entry): entry is { label: string; score: number } => entry.score != null,
  );

  const topicScores =
    (report.topicScores as Record<string, number> | null) ?? {};
  const topicEntries = Object.entries(topicScores).sort((a, b) => a[1] - b[1]);

  return (
    <div className="p-4 md:px-10 md:py-6 h-full flex flex-col gap-y-6 max-w-screen-xl mx-auto w-full">
      <Card>
        <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-1">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
              <FileTextIcon className="size-6 text-primary" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-lg md:text-xl font-semibold">{title}</h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {typeLabel && (
                  <Badge variant="secondary" className="text-[10px]">
                    {typeLabel}
                  </Badge>
                )}
                {candidateName && (
                  <span className="flex items-center gap-1">
                    <UserIcon className="size-3" />
                    {candidateName}
                  </span>
                )}
                <span>
                  Generated <RelativeTime date={report.createdAt} />
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-3xl font-black tabular-nums text-primary">
                <TrophyIcon className="size-6" />
                {report.overallScore}
              </div>
              {report.verdict && (
                <Badge
                  variant="outline"
                  className={`mt-1 text-[10px] font-bold uppercase tracking-tight ${
                    VERDICT_STYLES[report.verdict] || ""
                  }`}
                >
                  {VERDICT_LABELS[report.verdict as Verdict]}
                </Badge>
              )}
            </div>

            <Button
              variant="outline"
              disabled={exportReport.isPending}
              onClick={() => exportReport.mutate({ reportId: report.id })}
            >
              {exportReport.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <DownloadIcon className="size-4" />
              )}
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {scoreEntries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {scoreEntries.map((entry) => (
                <ScoreBar
                  key={entry.label}
                  label={entry.label}
                  score={entry.score}
                />
              ))}
              {report.timeComplexity && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Time Complexity
                    </span>
                    <Badge variant="secondary">{report.timeComplexity}</Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {topicEntries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Topic Scores</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {topicEntries.map(([topic, score]) => (
                <ScoreBar key={topic} label={topic} score={score} />
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {report.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LightbulbIcon className="size-4 text-primary" />
              Suggestions for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {report.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
                  <span className="text-muted-foreground">{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {interview?.questions && interview.questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Questions Covered</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {interview.questions.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between text-sm border-b last:border-b-0 py-2"
                >
                  <span>{item.question.title}</span>
                  {item.question.type && (
                    <Badge variant="secondary" className="text-[10px]">
                      {
                        INTERVIEW_TYPE_LABELS[
                          item.question
                            .type as keyof typeof INTERVIEW_TYPE_LABELS
                        ]
                      }
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export const ReportDetailsLoading = () => (
  <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground h-full min-h-[50vh]">
    <Loader2Icon className="size-4 animate-spin" />
    Loading report...
  </div>
);

export const ReportDetailsError = () => (
  <div className="flex flex-1 flex-col items-center justify-center gap-2 text-sm text-muted-foreground h-full min-h-[50vh]">
    <AlertTriangleIcon className="size-6 text-destructive" />
    Something went wrong loading this report. Please try again.
  </div>
);

export const ReportDetailsClient = ({ reportId }: { reportId: string }) => {
  return (
    <ErrorBoundary fallback={<ReportDetailsError />}>
      <React.Suspense fallback={<ReportDetailsLoading />}>
        <ReportDetailsData reportId={reportId} />
      </React.Suspense>
    </ErrorBoundary>
  );
};
