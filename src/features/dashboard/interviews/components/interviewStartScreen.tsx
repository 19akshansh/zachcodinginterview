"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Code2, MessageCircle, PlayCircle, Clock, Loader2 } from "lucide-react";
import {
  useStartInterview,
  type useSuspenseInterview,
} from "../hooks/useInterviews";

type InterviewData = ReturnType<typeof useSuspenseInterview>["data"];

export const InterviewStartScreen = ({
  interview,
}: {
  interview: InterviewData;
}) => {
  const startInterview = useStartInterview();

  const codingCount = interview.questions.filter(
    (q) => q.question.type === "CODING",
  ).length;
  const behavioralCount = interview.questions.filter(
    (q) => q.question.type === "BEHAVIORAL",
  ).length;

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
          {behavioralCount > 0 && (
            <Badge className="rounded-full px-4 py-1.5 flex gap-2 items-center">
              <MessageCircle className="size-3.5" />
              {behavioralCount} Behavioral
            </Badge>
          )}
          {codingCount > 0 && (
            <Badge
              variant="outline"
              className="rounded-full px-4 py-1.5 flex gap-2 items-center"
            >
              <Code2 className="size-3.5" />
              {codingCount} Coding
            </Badge>
          )}
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
