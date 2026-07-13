"use client";

import { CalendarIcon, FileTextIcon, TrophyIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "@/components/entityComponents";
import { RelativeTime } from "@/components/relativeTime";
import { Badge } from "@/components/ui/badge";
import { INTERVIEW_TYPE_LABELS, VERDICT_LABELS, Verdict } from "@/config/enums";
import { useEntitySearch } from "@/hooks/useEntitySearch";
import { useSuspenseReports } from "../hooks/useReports";
import { useReportsParams } from "../hooks/useReportsParams";

type ReportsQueryResult = ReturnType<typeof useSuspenseReports>;

const VERDICT_STYLES: Record<string, string> = {
  [Verdict.STRONG_HIRE]: "bg-primary/10 text-primary border-primary/20",
  [Verdict.HIRE]: "bg-primary/10 text-primary border-primary/20",
  [Verdict.LEAN_HIRE]: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  [Verdict.NO_HIRE]: "bg-red-500/10 text-red-500 border-red-500/20",
  [Verdict.STRONG_NO_HIRE]: "bg-red-500/10 text-red-500 border-red-500/20",
};

export const ReportsList = ({ reports }: { reports: ReportsQueryResult }) => {
  return (
    <EntityList
      items={reports.data.items}
      getKey={(item) => item.id}
      renderItem={(item) => <ReportItem data={item} />}
      emptyView={<ReportsEmpty />}
    />
  );
};

export const ReportsHeader = () => {
  return (
    <EntityHeader
      title="Reports"
      description="Detailed AI feedback and scoring from your completed interviews"
    />
  );
};

export const ReportsSearch = () => {
  const [params, setParams] = useReportsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search by title or candidate..."
    />
  );
};

export const ReportsPagination = ({
  reports,
}: {
  reports: ReportsQueryResult;
}) => {
  const [params, setParams] = useReportsParams();

  return (
    <EntityPagination
      disabled={reports.isFetching}
      totalPages={reports.data.totalPages}
      page={reports.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

const ReportsData = () => {
  const reports = useSuspenseReports();

  return (
    <EntityContainer
      header={<ReportsHeader />}
      search={<ReportsSearch />}
      pagination={<ReportsPagination reports={reports} />}
    >
      <ReportsList reports={reports} />
    </EntityContainer>
  );
};

export const ReportsContainer = () => {
  return (
    <React.Suspense fallback={<ReportsLoading />}>
      <ReportsData />
    </React.Suspense>
  );
};

export const ReportsLoading = () => (
  <LoadingView message="Loading your reports..." />
);

export const ReportsError = () => (
  <ErrorView message="Failed to load reports. Please try again." />
);

export const ReportsEmpty = () => {
  const router = useRouter();
  return (
    <EmptyView
      onNew={() => router.push("/interviews/new")}
      entity="Report"
      msg="Complete an interview to see your AI-generated report here."
    />
  );
};

export const ReportItem = ({ data }: { data: any }) => {
  const firstQuestion = data.interview?.questions?.[0]?.question;
  const title =
    data.interview?.title || firstQuestion?.title || "Interview Report";
  const typeLabel = data.interview?.type
    ? INTERVIEW_TYPE_LABELS[
        data.interview.type as keyof typeof INTERVIEW_TYPE_LABELS
      ]
    : null;
  const candidateName = data.interview?.candidate?.name;

  return (
    <EntityItem
      href={`/reports/${data.id}`}
      title={title}
      subtitle={
        <div className="flex flex-col gap-1.5 mt-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {typeLabel && (
              <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                {typeLabel}
              </Badge>
            )}
            {candidateName && (
              <>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <UserIcon className="size-3" />
                  {candidateName}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50">
            <span className="flex items-center gap-1">
              <CalendarIcon className="size-3" />
              <RelativeTime date={data.createdAt} />
            </span>
          </div>
        </div>
      }
      image={
        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-all duration-200">
          <FileTextIcon className="size-5 text-primary" />
        </div>
      }
      actions={
        <div className="flex flex-col items-end text-right mr-2 min-w-[80px] gap-1">
          <div className="flex items-center gap-1 text-primary font-bold text-sm">
            <TrophyIcon className="size-3" />
            Score {data.overallScore}
          </div>
          {data.verdict && (
            <Badge
              variant="outline"
              className={`text-[10px] font-bold uppercase tracking-tight ${
                VERDICT_STYLES[data.verdict] || ""
              }`}
            >
              {VERDICT_LABELS[data.verdict as Verdict]}
            </Badge>
          )}
        </div>
      }
    />
  );
};