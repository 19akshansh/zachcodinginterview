"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, Trophy, FileText } from "lucide-react";
import Link from "next/link";
import { VERDICT_LABELS } from "@/config/enums";
import type { useSuspenseInterview } from "../hooks/useInterviews";

type InterviewData = ReturnType<typeof useSuspenseInterview>["data"];

const VERDICT_STYLES: Record<string, string> = {
  STRONG_HIRE: "bg-green-500/10 text-green-500 border-green-500/20",
  HIRE: "bg-green-500/10 text-green-500 border-green-500/20",
  LEAN_HIRE: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  NO_HIRE: "bg-destructive/10 text-destructive border-destructive/20",
  STRONG_NO_HIRE: "bg-destructive/10 text-destructive border-destructive/20",
};

export const InterviewCompletedScreen = ({
  interview,
}: {
  interview: InterviewData;
}) => {
  const trpc = useTRPC();

  const { data } = useQuery({
    ...trpc.interviews.getOne.queryOptions({ id: interview.id }),
    initialData: interview,
    refetchInterval: (query) => (query.state.data?.report ? false : 4000),
  });

  const report = data.report;

  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="max-w-lg w-full p-8 text-center space-y-6">
        {!report ? (
          <>
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="size-6 text-primary animate-pulse" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold">
                Generating your AI feedback report
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This usually takes less than a minute. Feel free to keep this
                tab open &mdash; we'll show your results as soon as they're
                ready.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Analyzing your session...
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
              <Trophy className="size-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold">Interview complete!</h1>
              <p className="text-sm text-muted-foreground">
                Here's a quick look at how you did.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4">
              <div className="text-4xl font-black tabular-nums text-primary">
                {report.overallScore}
              </div>
              {report.verdict && (
                <Badge
                  variant="outline"
                  className={VERDICT_STYLES[report.verdict]}
                >
                  {VERDICT_LABELS[
                    report.verdict as keyof typeof VERDICT_LABELS
                  ] ?? report.verdict}
                </Badge>
              )}
            </div>

            <Button
              size="lg"
              className="w-full font-bold"
              render={
                <Link href={`/reports/${report.id}`}>
                  <FileText className="mr-2 size-4" />
                  View full report
                </Link>
              }
            />
            <Button
              variant="outline"
              className="w-full"
              render={<Link href="/interviews">Back to interviews</Link>}
            />
          </>
        )}
      </Card>
    </div>
  );
};
