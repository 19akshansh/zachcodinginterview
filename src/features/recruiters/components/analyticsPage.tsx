"use client";

import React from "react";
import {
  EmptyView,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "@/components/layout/shared/entityComponents";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { INTERVIEW_TYPE_LABELS } from "@/config/enums";
import { difficultyOptions } from "@/features/dashboard/interviews/types/typeOptions";
import { useEntitySearch } from "@/hooks/useEntitySearch";
import { useSuspenseAnalytics } from "../hooks/useRecruiters";
import { useRecruitersParams } from "../hooks/useRecruitersParams";

const DIFFICULTY_LABELS: Record<string, string> = Object.fromEntries(
  difficultyOptions.map((opt) => [opt.value, opt.label]),
);

const formatPercent = (value: number | null) =>
  value === null ? "—" : `${Math.round(value * 100)}%`;

const formatScore = (value: number | null) =>
  value === null ? "—" : String(value);

const AnalyticsTable = ({
  analytics,
}: {
  analytics: ReturnType<typeof useSuspenseAnalytics>;
}) => {
  const { data } = analytics;

  if (data.items.length === 0) {
    return (
      <EmptyView
        entity="analytics"
        msg="Author a question and get at least one completed, reported interview to see stats here."
      />
    );
  }

  return (
    <Card className="shadow-none">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead className="text-right">Attempts</TableHead>
              <TableHead className="text-right">Pass rate</TableHead>
              <TableHead className="text-right">Avg score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((row) => (
              <TableRow key={row.questionId}>
                <TableCell className="max-w-[280px] truncate font-medium">
                  {row.title}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-[10px]">
                    {INTERVIEW_TYPE_LABELS[row.type]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">
                    {DIFFICULTY_LABELS[row.difficulty] ?? row.difficulty}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {row.attemptCount}
                </TableCell>
                <TableCell className="text-right">
                  {formatPercent(row.passRate)}
                </TableCell>
                <TableCell className="text-right">
                  {formatScore(row.averageScore)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const AnalyticsSearch = () => {
  const [params, setParams] = useRecruitersParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search questions..."
    />
  );
};

const AnalyticsPagination = ({
  analytics,
}: {
  analytics: ReturnType<typeof useSuspenseAnalytics>;
}) => {
  const [params, setParams] = useRecruitersParams();

  return (
    <EntityPagination
      disabled={analytics.isFetching}
      totalPages={analytics.data.totalPages}
      page={analytics.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

const AnalyticsData = () => {
  const analytics = useSuspenseAnalytics();

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-end">
        <AnalyticsSearch />
      </div>
      <AnalyticsTable analytics={analytics} />
      <AnalyticsPagination analytics={analytics} />
    </div>
  );
};

const AnalyticsLoading = () => (
  <LoadingView message="Loading your analytics..." />
);

export const AnalyticsError = () => (
  <ErrorView message="Failed to load analytics. Please try again." />
);

export const AnalyticsPage = () => (
  <React.Suspense fallback={<AnalyticsLoading />}>
    <AnalyticsData />
  </React.Suspense>
);