"use client";

import React from "react";
import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityList,
  EntityPagination,
  ErrorView,
  LoadingView,
} from "@/components/layout/shared/entityComponents";
import { RelativeTime } from "@/components/layout/shared/relativeTime";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  INTERVIEW_TYPE_LABELS,
  QUESTION_APPROVAL_STATUS_LABELS,
  QuestionApprovalStatus,
  SENIORITY_LABELS,
} from "@/config/enums";
import { QuestionReviewDialog } from "./questionReviewDialog";
import { useSuspenseAdminPendingQuestions } from "../hooks/useAdmin";
import { useAdminQuestionsParams } from "../hooks/useAdminParams";

type QuestionsQueryResult = ReturnType<typeof useSuspenseAdminPendingQuestions>;
type QuestionItem = QuestionsQueryResult["data"]["items"][number];

const STATUS_TABS: { label: string; value: QuestionApprovalStatus }[] = [
  { label: "Pending", value: QuestionApprovalStatus.PENDING },
  { label: "Approved", value: QuestionApprovalStatus.APPROVED },
  { label: "Rejected", value: QuestionApprovalStatus.REJECTED },
];

const STATUS_BADGE_VARIANT: Record<
  QuestionApprovalStatus,
  "secondary" | "default" | "destructive"
> = {
  [QuestionApprovalStatus.PENDING]: "secondary",
  [QuestionApprovalStatus.APPROVED]: "default",
  [QuestionApprovalStatus.REJECTED]: "destructive",
};

const initialsFor = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const QuestionRow = ({ question }: { question: QuestionItem }) => {
  const [open, setOpen] = React.useState(false);
  const isPending = question.approvalStatus === QuestionApprovalStatus.PENDING;
  const author = question.createdBy;

  return (
    <>
      <Card className="p-4 shadow-none">
        <CardContent className="flex flex-col gap-3 p-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate text-base font-medium">
                  {question.title}
                </span>
                <Badge
                  variant={STATUS_BADGE_VARIANT[question.approvalStatus]}
                  className="text-[10px]"
                >
                  {QUESTION_APPROVAL_STATUS_LABELS[question.approvalStatus]}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {INTERVIEW_TYPE_LABELS[question.type]}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {question.difficulty.charAt(0) +
                    question.difficulty.slice(1).toLowerCase()}
                </Badge>
                {question.seniorityLevel && (
                  <Badge variant="outline" className="text-[10px]">
                    {SENIORITY_LABELS[question.seniorityLevel]}
                  </Badge>
                )}
              </div>
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {question.prompt}
              </p>
              {author && (
                <div className="mt-1 flex items-center gap-2">
                  <Avatar size="sm">
                    <AvatarImage
                      src={author.image ?? undefined}
                      alt={author.name}
                    />
                    <AvatarFallback>{initialsFor(author.name)}</AvatarFallback>
                  </Avatar>
                  <p className="truncate text-xs text-muted-foreground">
                    {author.name} · {author.email} · Created{" "}
                    <RelativeTime date={question.createdAt} />
                  </p>
                </div>
              )}
            </div>

            {isPending && (
              <Button
                size="sm"
                className="shrink-0"
                onClick={() => setOpen(true)}
              >
                Review
              </Button>
            )}
          </div>

          {!isPending && question.reviewNote && (
            <div className="rounded-lg border bg-muted/20 px-3 py-2 text-xs whitespace-pre-wrap break-words">
              <span className="font-medium text-foreground">
                Admin feedback:{" "}
              </span>
              <span className="text-muted-foreground">
                {question.reviewNote}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {isPending && (
        <QuestionReviewDialog
          open={open}
          onOpenChange={setOpen}
          questionId={question.id}
          title={question.title}
          prompt={question.prompt}
          topics={question.topics}
        />
      )}
    </>
  );
};

export const QuestionsReviewList = ({
  questions,
}: {
  questions: QuestionsQueryResult;
}) => (
  <EntityList
    items={questions.data.items}
    getKey={(item) => item.id}
    renderItem={(item) => <QuestionRow question={item} />}
    emptyView={<QuestionsReviewEmpty />}
  />
);

export const QuestionsReviewHeader = () => (
  <EntityHeader
    title="Question approvals"
    description="Review public questions submitted by recruiters."
  />
);

export const QuestionsReviewTabs = () => {
  const [params, setParams] = useAdminQuestionsParams();

  return (
    <Tabs
      value={params.status ?? QuestionApprovalStatus.PENDING}
      onValueChange={(value) =>
        setParams({
          ...params,
          status: value as QuestionApprovalStatus,
          page: 1,
        })
      }
    >
      <TabsList>
        {STATUS_TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export const QuestionsReviewPagination = ({
  questions,
}: {
  questions: QuestionsQueryResult;
}) => {
  const [params, setParams] = useAdminQuestionsParams();

  return (
    <EntityPagination
      disabled={questions.isFetching}
      totalPages={questions.data.totalPages}
      page={params.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

const QuestionsReviewData = () => {
  const questions = useSuspenseAdminPendingQuestions();

  return (
    <EntityContainer
      header={<QuestionsReviewHeader />}
      search={<QuestionsReviewTabs />}
      pagination={<QuestionsReviewPagination questions={questions} />}
    >
      <QuestionsReviewList questions={questions} />
    </EntityContainer>
  );
};

export const QuestionsReviewQueue = () => (
  <React.Suspense fallback={<QuestionsReviewLoading />}>
    <QuestionsReviewData />
  </React.Suspense>
);

export const QuestionsReviewLoading = () => (
  <LoadingView message="Loading questions..." />
);

export const QuestionsReviewError = () => (
  <ErrorView message="Failed to load questions. Please try again." />
);

export const QuestionsReviewEmpty = () => (
  <EmptyView entity="question" msg="No public questions in this status." />
);
