"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  LogOut,
  MessageCircle,
  Code2,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgrammingLanguage } from "@/config/enums";
import { useCountdown } from "../hooks/useCountdown";
import {
  useEndInterview,
  type useSuspenseInterview,
} from "../hooks/useInterviews";
import { SessionCodingPanel } from "./sessionCodingPanel";
import { SessionBehavioralPanel } from "./sessionBehavioralPanel";

type InterviewData = ReturnType<typeof useSuspenseInterview>["data"];
type InterviewQuestionData = InterviewData["questions"][number];

const isAnswered = (iq: InterviewQuestionData) =>
  iq.question.type === "BEHAVIORAL"
    ? Boolean(iq.behavioralAnswer?.trim())
    : iq.result === "PASSED" || iq.result === "PARTIAL";

export const InterviewSessionActive = ({
  interview,
}: {
  interview: InterviewData;
}) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const endInterview = useEndInterview();
  const [activeIndex, setActiveIndex] = useState(0);

  const questions = interview.questions;
  const activeQuestion = questions[activeIndex];

  const { label, isExpired, isLow } = useCountdown({
    startedAt: interview.startedAt,
    timeLimitMinutes: interview.timeLimitMinutes,
    onExpire: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.interviews.getOne.queryOptions({ id: interview.id })
          .queryKey,
      });
    },
  });

  const codingCount = questions.filter(
    (q) => q.question.type === "CODING",
  ).length;
  const behavioralCount = questions.filter(
    (q) => q.question.type === "BEHAVIORAL",
  ).length;

  const isLastQuestion = activeIndex === questions.length - 1;

  const handleEnd = () => {
    endInterview.mutate({ id: interview.id });
  };

  if (!activeQuestion) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        This interview has no questions attached.
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-6">
      <div className="flex flex-wrap items-center gap-4 border-b pb-6">
        <div className="flex items-center gap-3">
          {behavioralCount > 0 && (
            <Badge className="rounded-full px-4 py-1.5 flex gap-2 items-center">
              <MessageCircle className="size-3.5" />
              {behavioralCount} Behavioral question
              {behavioralCount === 1 ? "" : "s"}
            </Badge>
          )}
          {codingCount > 0 && (
            <>
              <div className="w-8 h-[1px] bg-border hidden sm:block" />
              <Badge
                variant="outline"
                className="rounded-full px-4 py-1.5 flex gap-2 items-center text-muted-foreground"
              >
                <Code2 className="size-3.5" />
                {codingCount} Coding question{codingCount === 1 ? "" : "s"}
              </Badge>
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div
            className={cn(
              "flex items-center gap-1.5 text-sm font-mono font-semibold px-2.5 py-1 rounded-lg border",
              isExpired
                ? "text-destructive border-destructive/30 bg-destructive/10"
                : isLow
                  ? "text-orange-500 border-orange-500/30 bg-orange-500/10"
                  : "text-muted-foreground border-transparent",
            )}
          >
            <Clock className="size-4" />
            {isExpired ? "Time's up" : label}
          </div>

          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  disabled={endInterview.isPending}
                >
                  {endInterview.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LogOut className="size-4" />
                  )}
                  End interview
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>End this interview?</AlertDialogTitle>
                <AlertDialogDescription>
                  You won't be able to make further changes once the interview
                  ends. We'll generate your AI feedback report right after.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep going</AlertDialogCancel>
                <AlertDialogAction onClick={handleEnd}>
                  End interview
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {questions.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          {questions.map((iq, index) => {
            const answered = isAnswered(iq);
            const isActive = index === activeIndex;
            return (
              <button
                key={iq.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : answered
                      ? "bg-green-500/10 text-green-600 border-green-500/20 hover:border-green-500/40"
                      : "bg-background border-border text-muted-foreground hover:border-primary/50",
                )}
              >
                {answered && !isActive ? (
                  <Check className="size-3" />
                ) : iq.question.type === "CODING" ? (
                  <Code2 className="size-3" />
                ) : (
                  <MessageCircle className="size-3" />
                )}
                Q{index + 1}
              </button>
            );
          })}
        </div>
      )}

      {activeQuestion.question.type === "BEHAVIORAL" ? (
        <SessionBehavioralPanel interviewQuestion={activeQuestion} />
      ) : (
        <SessionCodingPanel
          interviewId={interview.id}
          interviewQuestion={activeQuestion}
          defaultLanguage={
            (interview.language as unknown as ProgrammingLanguage) ??
            ProgrammingLanguage.PYTHON
          }
        />
      )}

      <div className="flex items-center justify-between pt-2 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
          disabled={activeIndex === 0}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>

        {isLastQuestion ? (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button size="sm" disabled={endInterview.isPending}>
                  {endInterview.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LogOut className="size-4" />
                  )}
                  Finish interview
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Finish this interview?</AlertDialogTitle>
                <AlertDialogDescription>
                  This is your last question. Ending the interview locks in your
                  answers and starts AI report generation.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep going</AlertDialogCancel>
                <AlertDialogAction onClick={handleEnd}>
                  Finish interview
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button
            size="sm"
            onClick={() =>
              setActiveIndex((i) => Math.min(questions.length - 1, i + 1))
            }
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
