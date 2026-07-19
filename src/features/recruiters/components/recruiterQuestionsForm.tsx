"use client";

import React from "react";
import { ErrorView } from "@/components/layout/shared/entityComponents";
import { useSuspenseMyQuestions } from "../hooks/useRecruiters";
import { QuestionForm } from "./questionForm";
import {
  QuestionsList,
  QuestionsLoading,
  QuestionsPagination,
  QuestionsSearch,
} from "./questionsTable";

export const RecruiterQuestionsHeader = () => (
  <div className="flex flex-col">
    <h1 className="text-lg md:text-xl font-semibold">Questions</h1>
    <p className="text-sm text-muted-foreground">
      Author your own interview questions and track their review status.
    </p>
  </div>
);

const QuestionsSection = () => {
  const questions = useSuspenseMyQuestions();

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between gap-x-4">
        <h2 className="text-sm font-semibold">Your questions</h2>
        <QuestionsSearch />
      </div>
      <QuestionsList questions={questions} />
      <QuestionsPagination questions={questions} />
    </div>
  );
};

export const RecruiterQuestionsContainer = () => (
  <div className="p-4 md:px-10 md:py-6 h-full max-w-[100vw] overflow-x-hidden">
    <div className="mx-auto max-w-screen-xl w-full flex flex-col gap-y-8">
      <RecruiterQuestionsHeader />
      <div className="max-w-2xl">
        <QuestionForm />
      </div>
      <React.Suspense fallback={<QuestionsLoading />}>
        <QuestionsSection />
      </React.Suspense>
    </div>
  </div>
);

export const RecruiterQuestionsError = () => (
  <ErrorView message="Failed to load the questions page. Please try again." />
);
