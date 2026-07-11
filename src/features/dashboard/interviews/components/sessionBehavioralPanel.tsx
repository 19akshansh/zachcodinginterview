"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Check, Loader2, MessageCircle } from "lucide-react";
import { useSaveBehavioralAnswer } from "@/features/dashboard/submissions/hooks/useSubmissions";
import { DEFAULTS } from "@/config/constants";

const AUTOSAVE_DELAY_MS = DEFAULTS.AUTOSAVE_DELAY_MS;

interface InterviewQuestionBehavioral {
  id: string;
  behavioralAnswer: string | null;
  question: {
    title: string;
    prompt: string;
    difficulty: string;
  };
}

export const SessionBehavioralPanel = ({
  interviewQuestion,
}: {
  interviewQuestion: InterviewQuestionBehavioral;
}) => {
  const [answer, setAnswer] = useState(
    interviewQuestion.behavioralAnswer ?? "",
  );
  const [savedAnswer, setSavedAnswer] = useState(
    interviewQuestion.behavioralAnswer ?? "",
  );
  const saveAnswer = useSaveBehavioralAnswer();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setAnswer(interviewQuestion.behavioralAnswer ?? "");
    setSavedAnswer(interviewQuestion.behavioralAnswer ?? "");
  }, [interviewQuestion.id]);

  useEffect(() => {
    if (answer === savedAnswer) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      if (!answer.trim()) return;
      saveAnswer.mutate(
        { interviewQuestionId: interviewQuestion.id, answer },
        { onSuccess: () => setSavedAnswer(answer) },
      );
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [answer]);

  const isDirty = answer !== savedAnswer;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
      <Card className="p-6 space-y-4 overflow-y-auto">
        <div className="flex gap-2">
          <Badge
            variant="secondary"
            className="text-[10px] uppercase font-bold"
          >
            <MessageCircle className="size-3" />
            Behavioral
          </Badge>
          <Badge variant="outline" className="text-[10px] uppercase font-bold">
            {interviewQuestion.question.difficulty}
          </Badge>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold leading-tight">
            {interviewQuestion.question.title}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {interviewQuestion.question.prompt}
          </p>
        </div>
      </Card>

      <Card className="p-6 flex flex-col gap-4 bg-secondary/20">
        <div className="space-y-1.5 flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Your Answer
            </label>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              {saveAnswer.isPending ? (
                <>
                  <Loader2 className="size-3 animate-spin" /> Saving...
                </>
              ) : isDirty ? (
                "Unsaved changes"
              ) : answer ? (
                <>
                  <Check className="size-3 text-green-500" /> Saved
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
            Answers save automatically as you type.
          </p>
        </div>
      </Card>
    </div>
  );
};
