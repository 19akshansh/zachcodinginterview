"use client";

import Link from "next/link";
import { ChevronLeft, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorView } from "@/components/entityComponents";
import { InterviewType, ProgrammingLanguage } from "@/config/enums";
import { useSuspensePracticeQuestion } from "../hooks/usePractice";
import { PracticeCodingPanel } from "./practiceCodingPanel";
import { PracticeTextPanel } from "./practiceTextPanel";

export const PracticeSession = ({
  id,
  defaultLanguage,
}: {
  id: string;
  defaultLanguage: ProgrammingLanguage;
}) => {
  const { data: question } = useSuspensePracticeQuestion(id);

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4 p-4 md:px-10 md:py-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/practice" />}
        >
          <ChevronLeft className="size-4" />
          Back to Practice
        </Button>
      </div>

      {question.type === InterviewType.CODING ? (
        <PracticeCodingPanel
          question={question as any}
          defaultLanguage={defaultLanguage}
        />
      ) : (
        <PracticeTextPanel question={question as any} />
      )}
    </div>
  );
};

export const PracticeLocked = () => (
  <div className="flex flex-1 items-center justify-center p-8">
    <div className="max-w-sm w-full text-center space-y-4 p-8 rounded-2xl border bg-card">
      <div className="size-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
        <Lock className="size-5 text-primary" />
      </div>
      <h2 className="text-lg font-semibold">This question is PRO-only</h2>
      <p className="text-sm text-muted-foreground">
        Free accounts can practice a portion of every category. Upgrade to PRO
        to unlock the full question bank.
      </p>
      <Button
        className="w-full"
        nativeButton={false}
        render={<Link href="/settings/billing" />}
      >
        <Sparkles className="size-4" />
        Upgrade to PRO
      </Button>
    </div>
  </div>
);

export const PracticeSessionError = () => (
  <ErrorView message="Failed to load this question. Please try again." />
);
