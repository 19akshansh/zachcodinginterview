"use client";

import { Clock, Loader2, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InterviewType } from "@/config/enums";
import {
  useStartInterview,
  type useSuspenseInterview,
} from "../hooks/useInterviews";
import { interviewTypeOptions } from "../types/typeOptions";

type InterviewData = ReturnType<typeof useSuspenseInterview>["data"];

export const InterviewStartScreen = ({
  interview,
}: {
  interview: InterviewData;
}) => {
  const startInterview = useStartInterview();

  const typeCounts = interview.questions.reduce<
    Partial<Record<InterviewType, number>>
  >((acc, q) => {
    const t = q.question.type as InterviewType;
    acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="max-w-lg w-full p-8 text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl font-bold">
            {interview.title || "Ready to begin your interview?"}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Once you start, the timer begins and can't be paused. Make sure
            you're in a quiet spot with a stable connection.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {interviewTypeOptions.map((opt) => {
            const count = typeCounts[opt.value];
            if (!count) return null;
            return (
              <Badge
                key={opt.value}
                variant="default"
                className="rounded-full px-4 py-1.5 flex gap-2 items-center"
              >
                <opt.icon className="size-3.5" />
                {count} {opt.label}
              </Badge>
            );
          })}
          <Badge
            variant="outline"
            className="rounded-full px-4 py-1.5 flex gap-2 items-center text-muted-foreground"
          >
            <Clock className="size-3.5" />
            {interview.timeLimitMinutes} min limit
          </Badge>
        </div>

        <Button
          size="lg"
          className="w-full font-bold shadow-lg shadow-primary/20"
          onClick={() => startInterview.mutate({ id: interview.id })}
          disabled={startInterview.isPending}
        >
          {startInterview.isPending ? (
            <Loader2 className="mr-2 size-5 animate-spin" />
          ) : (
            <PlayCircle className="mr-2 size-5" />
          )}
          Start Interview
        </Button>
      </Card>
    </div>
  );
};
