import { FileTextIcon, LightbulbIcon, TrophyIcon, UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { INTERVIEW_TYPE_LABELS, VERDICT_LABELS, Verdict } from "@/config/enums";
import type { trpc } from "@/trpc/server";
import type { inferOutput } from "@trpc/tanstack-react-query";

type PublicReport = inferOutput<typeof trpc.reports.getByShareId>;

const VERDICT_STYLES: Record<string, string> = {
  [Verdict.STRONG_HIRE]: "bg-primary/10 text-primary border-primary/20",
  [Verdict.HIRE]: "bg-primary/10 text-primary border-primary/20",
  [Verdict.LEAN_HIRE]: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  [Verdict.NO_HIRE]: "bg-red-500/10 text-red-500 border-red-500/20",
  [Verdict.STRONG_NO_HIRE]: "bg-red-500/10 text-red-500 border-red-500/20",
};

const scoreColor = (score: number) => {
  if (score >= 80) return "bg-primary";
  if (score >= 60) return "bg-orange-500";
  return "bg-red-500";
};

const ScoreBar = ({ label, score }: { label: string; score: number }) => (
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

export const PublicReportView = ({ report }: { report: PublicReport }) => {
  const interview = report.interview;
  const firstQuestion = interview.questions[0]?.question;
  const title = interview.title || firstQuestion?.title || "Interview Report";
  const typeLabel = INTERVIEW_TYPE_LABELS[interview.type];
  const topicScores = (report.topicScores as Record<string, number> | null) ?? {};
  const scores = [
    ["Communication", report.communication],
    ["Problem Solving", report.problemSolving],
    ["Code Quality", report.codeQuality],
    ["Optimization", report.optimization],
    ["Cleanliness", report.cleanliness],
    ["Confidence", report.confidence],
  ].filter((entry): entry is [string, number] => typeof entry[1] === "number");

  return (
    <main className="min-h-screen bg-background px-4 py-8 md:py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Card>
          <CardContent className="flex flex-col gap-6 pt-1 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                <FileTextIcon className="size-6 text-primary" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-xl font-semibold">{title}</h1>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-[10px]">{typeLabel}</Badge>
                  {interview.candidate.name && (
                    <span className="flex items-center gap-1"><UserIcon className="size-3" />{interview.candidate.name}</span>
                  )}
                  <span>{interview.difficulty}</span>
                  <span>{interview.seniorityLevel}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-3xl font-black tabular-nums text-primary">
                <TrophyIcon className="size-6" />{report.overallScore}
              </div>
              {report.verdict && (
                <Badge variant="outline" className={`mt-1 text-[10px] font-bold uppercase ${VERDICT_STYLES[report.verdict] || ""}`}>
                  {VERDICT_LABELS[report.verdict as Verdict]}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {scores.length > 0 && (
            <Card><CardHeader><CardTitle>Score Breakdown</CardTitle></CardHeader><CardContent className="flex flex-col gap-4">
              {scores.map(([label, score]) => <ScoreBar key={label} label={label} score={score} />)}
              {report.timeComplexity && <><Separator /><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Time Complexity</span><Badge variant="secondary">{report.timeComplexity}</Badge></div></>}
            </CardContent></Card>
          )}
          {Object.keys(topicScores).length > 0 && (
            <Card><CardHeader><CardTitle>Topic Scores</CardTitle></CardHeader><CardContent className="flex flex-col gap-4">
              {Object.entries(topicScores).sort((a, b) => a[1] - b[1]).map(([topic, score]) => <ScoreBar key={topic} label={topic} score={score} />)}
            </CardContent></Card>
          )}
        </div>

        {report.suggestions.length > 0 && (
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><LightbulbIcon className="size-4 text-primary" />Suggestions for Improvement</CardTitle></CardHeader><CardContent>
            <ul className="flex flex-col gap-3">{report.suggestions.map((suggestion, index) => <li key={index} className="flex items-start gap-2 text-sm"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" /><span className="text-muted-foreground">{suggestion}</span></li>)}</ul>
          </CardContent></Card>
        )}

        {interview.questions.length > 0 && (
          <Card><CardHeader><CardTitle>Questions Covered</CardTitle></CardHeader><CardContent>
            <ul className="flex flex-col gap-2">{interview.questions.map((item, index) => <li key={index} className="flex items-center justify-between border-b py-2 text-sm last:border-b-0"><span>{item.question.title}</span><Badge variant="secondary" className="text-[10px]">{INTERVIEW_TYPE_LABELS[item.question.type]}</Badge></li>)}</ul>
          </CardContent></Card>
        )}
        <p className="text-center text-xs text-muted-foreground">Shared read-only interview report</p>
      </div>
    </main>
  );
};
