"use client";

import React from "react";
import {
  EmptyView,
  EntityList,
  EntityPagination,
  ErrorView,
  LoadingView,
} from "@/components/layout/shared/entityComponents";
import { RelativeTime } from "@/components/layout/shared/relativeTime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  INTERVIEW_TYPE_LABELS,
  SENIORITY_LABELS,
  VERDICT_LABELS,
  Verdict,
} from "@/config/enums";
import { useSuspenseReviewQueue } from "../hooks/useRecruiters";
import { useRecruiterReviewParams } from "../hooks/useRecruitersParams";
import { ReviewDialog } from "./reviewDialog";

type ReviewQueueResult = ReturnType<typeof useSuspenseReviewQueue>;
type ReviewItem = ReviewQueueResult["data"]["items"][number];

const VERDICT_STYLES: Record<string, string> = {
  [Verdict.STRONG_HIRE]: "bg-primary/10 text-primary border-primary/20",
  [Verdict.HIRE]: "bg-primary/10 text-primary border-primary/20",
  [Verdict.LEAN_HIRE]: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  [Verdict.NO_HIRE]: "bg-red-500/10 text-red-500 border-red-500/20",
  [Verdict.STRONG_NO_HIRE]: "bg-red-500/10 text-red-500 border-red-500/20",
};

const ReviewRow = ({ interview }: { interview: ReviewItem }) => {
  const [open, setOpen] = React.useState(false);
  const displayName = interview.candidate.name || interview.candidate.email;
  const report = interview.report;

  return (
    <>
      <Card className="p-4 shadow-none">
        <CardContent className="flex flex-col gap-3 p-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle className="truncate text-base font-medium">
              {displayName}
            </CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-x-1.5 text-xs">
              {INTERVIEW_TYPE_LABELS[interview.type]} ·{" "}
              {SENIORITY_LABELS[interview.seniorityLevel]} ·{" "}
              {interview.difficulty.charAt(0) +
                interview.difficulty.slice(1).toLowerCase()}
              {interview.endedAt && (
                <>
                  {" "}
                  · Completed <RelativeTime date={interview.endedAt} />
                </>
              )}
            </CardDescription>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {report && (
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-bold text-primary">
                  Score {report.overallScore}
                </span>
                {report.verdict && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold uppercase tracking-tight ${
                      VERDICT_STYLES[report.verdict] || ""
                    }`}
                  >
                    {VERDICT_LABELS[report.verdict as Verdict]}
                  </Badge>
                )}
              </div>
            )}
            <Button size="sm" onClick={() => setOpen(true)}>
              Review
            </Button>
          </div>
        </CardContent>
      </Card>

      {report && (
        <ReviewDialog
          open={open}
          onOpenChange={setOpen}
          interviewId={interview.id}
          reportId={report.id}
          candidateName={displayName}
        />
      )}
    </>
  );
};

export const ReviewList = ({ queue }: { queue: ReviewQueueResult }) => (
  <EntityList
    items={queue.data.items}
    getKey={(item) => item.id}
    renderItem={(item) => <ReviewRow interview={item} />}
    emptyView={<ReviewEmpty />}
  />
);

export const ReviewHeader = () => (
  <div className="flex flex-col">
    <h2 className="text-sm font-semibold">Awaiting your decision</h2>
    <p className="text-xs text-muted-foreground">
      Candidates who&apos;ve completed an interview you assigned.
    </p>
  </div>
);

export const ReviewPagination = ({ queue }: { queue: ReviewQueueResult }) => {
  const [params, setParams] = useRecruiterReviewParams();

  return (
    <EntityPagination
      disabled={queue.isFetching}
      totalPages={queue.data.totalPages}
      page={params.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

const ReviewData = () => {
  const queue = useSuspenseReviewQueue();

  return (
    <div className="flex flex-col gap-y-4">
      <ReviewHeader />
      <ReviewList queue={queue} />
      <ReviewPagination queue={queue} />
    </div>
  );
};

export const ReviewQueue = () => (
  <React.Suspense fallback={<ReviewLoading />}>
    <ReviewData />
  </React.Suspense>
);

export const ReviewLoading = () => (
  <LoadingView message="Loading your review queue..." />
);

export const ReviewError = () => (
  <ErrorView message="Failed to load your review queue. Please try again." />
);

export const ReviewEmpty = () => (
  <EmptyView
    entity="candidate"
    msg="Nothing to review right now — you'll see candidates here once they complete an interview you assigned."
  />
);
