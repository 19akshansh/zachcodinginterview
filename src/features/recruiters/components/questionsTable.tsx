"use client";

import React from "react";
import { AlertTriangleIcon, Loader2Icon, TrashIcon } from "lucide-react";
import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "@/components/layout/shared/entityComponents";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
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
import { useEntitySearch } from "@/hooks/useEntitySearch";
import { INTERVIEW_TYPE_LABELS, QuestionApprovalStatus } from "@/config/enums";
import {
  useDeleteQuestion,
  useSuspenseMyQuestions,
} from "../hooks/useRecruiters";
import { useRecruitersParams } from "../hooks/useRecruitersParams";

type QuestionsQueryResult = ReturnType<typeof useSuspenseMyQuestions>;
type QuestionItem = QuestionsQueryResult["data"]["items"][number];

const StatusBadge = ({ question }: { question: QuestionItem }) => {
  if (!question.isPublic) {
    return <Badge variant="outline">Private</Badge>;
  }
  if (question.approvalStatus === QuestionApprovalStatus.APPROVED) {
    return <Badge>Public</Badge>;
  }
  if (question.approvalStatus === QuestionApprovalStatus.REJECTED) {
    return <Badge variant="destructive">Rejected</Badge>;
  }
  return <Badge variant="secondary">Pending review</Badge>;
};

const QuestionRow = ({ question }: { question: QuestionItem }) => {
  const deleteQuestion = useDeleteQuestion();
  const usedInInterview = question._count.interviewQuestions > 0;
  const denyReason =
    question.approvalStatus === QuestionApprovalStatus.REJECTED
      ? question.reviewNote
      : null;

  return (
    <Card className="p-4 shadow-none">
      <CardContent className="flex flex-col gap-3 p-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="truncate text-base font-medium">
                {question.title}
              </CardTitle>
              <StatusBadge question={question} />
              <Badge variant="secondary" className="text-[10px]">
                {INTERVIEW_TYPE_LABELS[question.type]}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2 text-xs">
              {question.prompt}
            </CardDescription>
          </div>

          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={usedInInterview || deleteQuestion.isPending}
                  title={
                    usedInInterview
                      ? "Already used in a candidate's interview — can't be deleted"
                      : "Delete question"
                  }
                >
                  {deleteQuestion.isPending ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <TrashIcon className="size-4 text-destructive" />
                  )}
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this question?</AlertDialogTitle>
                <AlertDialogDescription>
                  This can&apos;t be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep it</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => deleteQuestion.mutate({ id: question.id })}
                >
                  Yes, delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {denyReason && (
          <div className="flex w-full items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-destructive">
            <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold">Deny reason</p>
              <p className="whitespace-pre-wrap break-words text-xs text-destructive/90">
                {denyReason}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const QuestionsList = ({
  questions,
}: {
  questions: QuestionsQueryResult;
}) => (
  <EntityList
    items={questions.data.items}
    getKey={(item) => item.id}
    renderItem={(item) => <QuestionRow question={item} />}
    emptyView={<QuestionsEmpty />}
  />
);

export const QuestionsHeader = () => (
  <EntityHeader
    title="Your questions"
    description="Everything you've authored, with its current visibility."
  />
);

export const QuestionsSearch = () => {
  const [params, setParams] = useRecruitersParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search your questions..."
    />
  );
};

export const QuestionsPagination = ({
  questions,
}: {
  questions: QuestionsQueryResult;
}) => {
  const [params, setParams] = useRecruitersParams();

  return (
    <EntityPagination
      disabled={questions.isFetching}
      totalPages={questions.data.totalPages}
      page={questions.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

const QuestionsData = () => {
  const questions = useSuspenseMyQuestions();

  return (
    <EntityContainer
      header={<QuestionsHeader />}
      search={<QuestionsSearch />}
      pagination={<QuestionsPagination questions={questions} />}
    >
      <QuestionsList questions={questions} />
    </EntityContainer>
  );
};

export const QuestionsTable = () => (
  <React.Suspense fallback={<QuestionsLoading />}>
    <QuestionsData />
  </React.Suspense>
);

export const QuestionsLoading = () => (
  <LoadingView message="Loading your questions..." />
);

export const QuestionsError = () => (
  <ErrorView message="Failed to load your questions. Please try again." />
);

export const QuestionsEmpty = () => (
  <EmptyView
    entity="question"
    msg="Write your first question above to use it in interviews you assign."
  />
);
