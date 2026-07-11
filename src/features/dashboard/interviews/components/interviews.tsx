"use client";

import React from "react";
import {
  EntityHeader,
  EntityContainer,
  EntitySearch,
  EntityPagination,
  LoadingView,
  ErrorView,
  EmptyView,
  EntityList,
  EntityItem,
} from "@/components/entityComponents";
import {
  useRemoveInterview,
  useSuspenseInterviews,
} from "../hooks/useInterviews";
import { useRouter } from "next/navigation";
import { useInterviewsParams } from "../hooks/useInterviewsParams";
import { useEntitySearch } from "@/hooks/useEntitySearch";
import {
  Code2Icon,
  MessageSquareIcon,
  TrophyIcon,
  CalendarIcon,
  ActivityIcon,
} from "lucide-react";
import { RelativeTime } from "@/components/relativeTime";
import { Badge } from "@/components/ui/badge";

type InterviewsQueryResult = ReturnType<typeof useSuspenseInterviews>;

export const InterviewsList = ({
  interviews,
}: {
  interviews: InterviewsQueryResult;
}) => {
  return (
    <EntityList
      items={interviews.data.items}
      getKey={(item) => item.id}
      renderItem={(item) => <InterviewItem data={item} />}
      emptyView={<InterviewsEmpty />}
    />
  );
};

export const InterviewsHeader = () => {
  return (
    <EntityHeader
      title="Interviews"
      description="Practice coding and behavioral sessions backed with AI feedback"
      newButtonHref="/interviews/new"
      newButtonLabel="Start an Interview"
    />
  );
};

export const InterviewsSearch = () => {
  const [params, setParams] = useInterviewsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search by Interview title..."
    />
  );
};

export const InterviewsPagination = ({
  interviews,
}: {
  interviews: InterviewsQueryResult;
}) => {
  const [params, setParams] = useInterviewsParams();

  return (
    <EntityPagination
      disabled={interviews.isFetching}
      totalPages={interviews.data.totalPages}
      page={interviews.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

const InterviewsData = () => {
  const interviews = useSuspenseInterviews();

  return (
    <EntityContainer
      header={<InterviewsHeader />}
      search={<InterviewsSearch />}
      pagination={<InterviewsPagination interviews={interviews} />}
    >
      <InterviewsList interviews={interviews} />
    </EntityContainer>
  );
};

export const InterviewsContainer = () => {
  return (
    <React.Suspense fallback={<InterviewsLoading />}>
      <InterviewsData />
    </React.Suspense>
  );
};

export const InterviewsLoading = () => (
  <LoadingView message="Loading your interview history..." />
);

export const InterviewsError = () => (
  <ErrorView message="Failed to load interviews. Please try again." />
);

export const InterviewsEmpty = () => {
  const router = useRouter();
  return (
    <EmptyView
      onNew={() => router.push("/interviews/new")}
      entity="Interview"
      msg="You haven't started any interviews yet."
    />
  );
};

export const InterviewItem = ({ data }: { data: any }) => {
  const removeInterview = useRemoveInterview();
  const firstQuestion = data.questions?.[0]?.question;
  const isCoding = firstQuestion?.type === "CODING" || data.type === "CODING";
  const questionCount = data.questions?.length ?? 0;

  const handleRemove = () => {
    removeInterview.mutate({ id: data.id });
  };

  const renderStatus = () => {
    if (data.status === "COMPLETED" && data.report) {
      return (
        <div className="flex flex-col items-end text-right mr-2 min-w-[80px]">
          <div className="flex items-center gap-1 text-primary font-bold text-sm">
            <TrophyIcon className="size-3" />
            Score {data.report.overallScore}
          </div>
          <span className="text-[10px] uppercase font-black opacity-50 tracking-widest">
            {data.report.verdict}
          </span>
        </div>
      );
    }

    const statusStyles: Record<string, string> = {
      SCHEDULED: "bg-primary/10 text-primary border-primary/20",
      IN_PROGRESS:
        "bg-orange-500/10 text-orange-500 border-orange-500/20 animate-pulse",
      ABANDONED: "bg-muted text-muted-foreground",
    };

    return (
      <Badge
        variant="outline"
        className={`mr-2 text-[10px] font-bold uppercase tracking-tight ${
          statusStyles[data.status] || ""
        }`}
      >
        {data.status === "IN_PROGRESS" && (
          <ActivityIcon className="size-2.5 mr-1" />
        )}
        {data.status.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <EntityItem
      href={`/interviews/${data.id}`}
      title={
        data.title || firstQuestion?.title || "Behavioral + Coding Session"
      }
      subtitle={
        <div className="flex flex-col gap-1.5 mt-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
              {data.difficulty}
            </Badge>
            <span>&bull;</span>
            <span className="font-medium">{data.seniorityLevel}</span>
            {questionCount > 0 && (
              <>
                <span>&bull;</span>
                <span>
                  {questionCount} question{questionCount === 1 ? "" : "s"}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50">
            <span className="flex items-center gap-1">
              <CalendarIcon className="size-3" />
              <RelativeTime date={data.createdAt} />
            </span>
            {data.language && (
              <>
                <span>&bull;</span>
                <span className="uppercase font-mono">{data.language}</span>
              </>
            )}
          </div>
        </div>
      }
      image={
        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-all duration-200">
          {isCoding ? (
            <Code2Icon className="size-5 text-primary" />
          ) : (
            <MessageSquareIcon className="size-5 text-primary" />
          )}
        </div>
      }
      actions={renderStatus()}
      onRemove={handleRemove}
      isRemoving={removeInterview.isPending}
    />
  );
};
