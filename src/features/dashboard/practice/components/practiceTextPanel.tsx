"use client";

import { Check, Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULTS } from "@/config/constants";
import type { InterviewType } from "@/config/enums";
import { cn } from "@/lib/utils";
import {
  useSaveDraftTextAnswer,
  useSubmitTextAnswer,
} from "../hooks/usePractice";
import { interviewTypeMeta } from "../../interviews/types/typeOptions";

const AUTOSAVE_DELAY_MS = DEFAULTS.AUTOSAVE_DELAY_MS;

const RESULT_STYLES: Record<string, string> = {
  PASSED: "bg-green-500/10 text-green-600 border-green-500/20",
  PARTIAL: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  FAILED: "bg-destructive/10 text-destructive border-destructive/20",
};

interface PracticeQuestionText {
  id: string;
  title: string;
  prompt: string;
  difficulty: string;
  type: InterviewType;
  attempt: {
    behavioralAnswer: string | null;
    result: string | null;
    aiFeedback: string | null;
  } | null;
}

export const PracticeTextPanel = ({
  question,
}: {
  question: PracticeQuestionText;
}) => {
  const [answer, setAnswer] = useState(
    question.attempt?.behavioralAnswer ?? "",
  );
  const [savedAnswer, setSavedAnswer] = useState(
    question.attempt?.behavioralAnswer ?? "",
  );
  const [result, setResult] = useState(question.attempt?.result ?? null);
  const [feedback, setFeedback] = useState(
    question.attempt?.aiFeedback ?? null,
  );

  const saveDraft = useSaveDraftTextAnswer();
  const submitAnswer = useSubmitTextAnswer();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setAnswer(question.attempt?.behavioralAnswer ?? "");
    setSavedAnswer(question.attempt?.behavioralAnswer ?? "");
    setResult(question.attempt?.result ?? null);
    setFeedback(question.attempt?.aiFeedback ?? null);
  }, [question.id]);

  useEffect(() => {
    if (answer === savedAnswer) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      if (!answer.trim()) return;
      saveDraft.mutate(
        { questionId: question.id, answer },
        { onSuccess: () => setSavedAnswer(answer) },
      );
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [answer]);

  const handleGrade = () => {
    submitAnswer.mutate(
      { questionId: question.id, answer },
      {
        onSuccess: (data) => {
          setSavedAnswer(answer);
          setResult(data.result);
          setFeedback(data.aiFeedback ?? null);
        },
      },
    );
  };

  const isDirty = answer !== savedAnswer;
  const meta = interviewTypeMeta[question.type];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
      <Card className="p-6 space-y-4 overflow-y-auto">
        <div className="flex gap-2">
          <Badge
            variant="secondary"
            className="text-[10px] uppercase font-bold"
          >
            <meta.icon className="size-3" />
            {meta.label}
          </Badge>
          <Badge variant="outline" className="text-[10px] uppercase font-bold">
            {question.difficulty}
          </Badge>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold leading-tight">
            {question.title}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {question.prompt}
          </p>
        </div>

        {result && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 pt-3">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-bold uppercase",
                  RESULT_STYLES[result],
                )}
              >
                AI verdict: {result}
              </Badge>
            </div>
            {feedback && (
              <p className="text-sm leading-relaxed p-3 rounded-lg border bg-muted/30">
                {feedback}
              </p>
            )}
          </div>
        )}
      </Card>

      <Card className="p-6 flex flex-col gap-4 bg-secondary/20">
        <div className="space-y-1.5 flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Your Answer
            </label>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              {saveDraft.isPending ? (
                <>
                  <Loader2 className="size-3 animate-spin" /> Saving...
                </>
              ) : isDirty ? (
                "Unsaved changes"
              ) : answer ? (
                <>
                  <Check className="size-3 text-green-500" /> Draft saved
                </>
              ) : null}
            </span>
          </div>
          <Textarea
            placeholder="Start typing your response..."
            className="flex-1 min-h-[220px] bg-background resize-none"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <p className="text-xs text-muted-foreground/70">
            Your draft saves automatically. Click below when you're ready for AI
            feedback on correctness and structure.
          </p>
        </div>

        <Button
          onClick={handleGrade}
          disabled={submitAnswer.isPending || !answer.trim()}
        >
          {submitAnswer.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          Submit for AI Feedback
        </Button>
      </Card>
    </div>
  );
};
