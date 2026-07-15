"use client";

import {
  ChevronRightIcon,
  Dumbbell,
  FileBarChart,
  FileText,
  MessagesSquare,
  TrendingUpIcon,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import {
  EntityContainer,
  EntityHeader,
  EntityPagination,
  ErrorView,
  LoadingView,
} from "@/components/layout/shared/entityComponents";
import { RelativeTime } from "@/components/layout/shared/relativeTime";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  INTERVIEW_TYPE_LABELS,
  InterviewStatus,
  VERDICT_LABELS,
  Verdict,
} from "@/config/enums";
import { ActivityCalendar } from "@/features/dashboard/profile/components/activityCalendar";
import { authClient } from "@/lib/auth/client";
import {
  useSuspenseDashboardRecentInterviews,
  useSuspenseDashboardScoreTrend,
  useSuspenseDashboardSummary,
} from "../hooks/useHome";
import { useHomeParams } from "../hooks/useHomeParams";

const VERDICT_STYLES: Record<string, string> = {
  [Verdict.STRONG_HIRE]: "bg-primary/10 text-primary border-primary/20",
  [Verdict.HIRE]: "bg-primary/10 text-primary border-primary/20",
  [Verdict.LEAN_HIRE]: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  [Verdict.NO_HIRE]: "bg-red-500/10 text-red-500 border-red-500/20",
  [Verdict.STRONG_NO_HIRE]: "bg-red-500/10 text-red-500 border-red-500/20",
};

const titleCase = (value: string) =>
  value.charAt(0) + value.slice(1).toLowerCase();

const QUICK_ACTIONS = [
  {
    href: "/interviews/new",
    label: "Start interview",
    description: "Pick a type and difficulty",
    icon: MessagesSquare,
    accent: "text-primary bg-primary/10 border-primary/20",
  },
  {
    href: "/practice",
    label: "Practice",
    description: "Low-stakes single questions",
    icon: Dumbbell,
    accent: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  },
  {
    href: "/resume",
    label: "Resume",
    description: "Unlocks resume-based rounds",
    icon: FileText,
    accent: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  },
  {
    href: "/reports",
    label: "Reports",
    description: "Review your AI feedback",
    icon: FileBarChart,
    accent: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
] as const;

const DashboardHeader = () => {
  const { data: session } = authClient.useSession();
  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <EntityHeader
      title={firstName ? `Welcome back, ${firstName}` : "Dashboard"}
      description="Your interview prep at a glance."
      newButtonHref="/interviews/new"
      newButtonLabel="Start an Interview"
    />
  );
};

const QuickActions = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {QUICK_ACTIONS.map((action) => (
        <Link key={action.href} href={action.href} prefetch className="group">
          <Card className="p-4 shadow-none ring-1 ring-border hover:ring-primary/30 hover:shadow-sm transition-all cursor-pointer h-full">
            <CardContent className="p-0 flex flex-col gap-3">
              <div
                className={`size-9 rounded-lg border flex items-center justify-center transition-colors ${action.accent}`}
              >
                <action.icon className="size-4.5" />
              </div>
              <div>
                <p className="text-sm font-medium">{action.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {action.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

const StatCard = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <Card className="p-4 shadow-none ring-1 ring-border">
    <CardContent className="p-0">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
    </CardContent>
  </Card>
);

const StatCards = () => {
  const { data } = useSuspenseDashboardSummary();

  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard label="Completed" value={data.completedCount} />
      <StatCard label="Avg score" value={data.avgScore} />
      <StatCard label="This week" value={data.weeklyCount} />
    </div>
  );
};

const RecentInterviews = () => {
  const recent = useSuspenseDashboardRecentInterviews();
  const [, setParams] = useHomeParams();
  const { items, page, totalPages, totalCount, pageSize } = recent.data;

  return (
    <Card className="p-5 shadow-none ring-1 ring-border">
      <CardContent className="p-0">
        <p className="text-sm font-medium text-muted-foreground mb-2">
          Recent activity
        </p>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            You haven&apos;t started any interviews yet.
          </p>
        ) : (
          <div className="flex flex-col">
            {items.map((item, i) => {
              const isScheduled = item.status === InterviewStatus.SCHEDULED;
              const typeLabel = INTERVIEW_TYPE_LABELS[item.type];
              const title =
                item.title ?? `${typeLabel}, ${titleCase(item.difficulty)}`;

              const statusLabel = isScheduled
                ? "Scheduled"
                : item.report
                  ? `Completed - scored ${item.report.overallScore}`
                  : titleCase(item.status).replace("_", " ");

              return (
                <Link
                  key={item.id}
                  href={
                    isScheduled
                      ? `/interviews/${item.id}`
                      : item.report
                        ? `/reports/${item.id}`
                        : `/interviews/${item.id}`
                  }
                  className={`flex items-center justify-between py-2.5 group ${
                    i !== items.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm truncate group-hover:text-primary transition-colors">
                      {title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {statusLabel}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {item.report?.verdict && (
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold uppercase tracking-tight ${
                          VERDICT_STYLES[item.report.verdict] || ""
                        }`}
                      >
                        {VERDICT_LABELS[item.report.verdict]}
                      </Badge>
                    )}
                    {isScheduled ? (
                      <ChevronRightIcon className="size-4 text-muted-foreground" />
                    ) : (
                      <RelativeTime date={item.createdAt} />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
      {totalCount > pageSize && (
        <div className="pt-2">
          <EntityPagination
            disabled={recent.isFetching}
            page={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setParams({ page: newPage })}
          />
        </div>
      )}
    </Card>
  );
};

const ScoreTrend = () => {
  const { data } = useSuspenseDashboardScoreTrend(5);

  if (data.length === 0) {
    return (
      <Card className="p-5 shadow-none ring-1 ring-border h-full flex flex-col">
        <CardContent className="p-0 flex-1 flex flex-col">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Score trend
          </p>
          <div className="flex-1 flex items-center justify-center text-center">
            <p className="text-sm text-muted-foreground py-6">
              Complete an interview to start tracking your score trend.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const width = 260;
  const height = 130;
  const chartLeft = 20;
  const chartRight = width - 10;
  const chartTop = 20;
  const chartBottom = 100;

  const step =
    data.length > 1 ? (chartRight - chartLeft) / (data.length - 1) : 0;

  const points = data.map((point, i) => {
    const x =
      data.length > 1 ? chartLeft + step * i : (chartLeft + chartRight) / 2;
    const y =
      chartBottom -
      (Math.max(0, Math.min(100, point.score)) / 100) *
        (chartBottom - chartTop);
    return { ...point, x, y };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const latest = points[points.length - 1];

  return (
    <Card className="p-5 shadow-none ring-1 ring-border h-full">
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-muted-foreground">
            Score trend
          </p>
          <div className="flex items-center gap-1 text-xs font-medium text-primary">
            <TrendingUpIcon className="size-3.5" />
            {latest.score}
          </div>
        </div>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-[130px]"
          role="img"
          aria-label={`Line chart of the last ${data.length} interview scores: ${data
            .map((d) => d.score)
            .join(", ")}`}
        >
          <line
            x1={chartLeft}
            y1={chartBottom}
            x2={chartRight}
            y2={chartBottom}
            stroke="var(--border)"
            strokeWidth="1"
          />
          {points.length > 1 && (
            <polyline
              points={polyline}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {points.map((p, i) => (
            <g key={p.date.toString()}>
              <circle
                cx={p.x}
                cy={p.y}
                r={i === points.length - 1 ? 4 : 3}
                fill="var(--color-primary)"
              />
              <text
                x={p.x}
                y={Math.max(10, p.y - 10)}
                textAnchor="middle"
                fontSize="11"
                fontWeight={i === points.length - 1 ? 500 : 400}
                fill={
                  i === points.length - 1
                    ? "var(--foreground)"
                    : "var(--muted-foreground)"
                }
              >
                {p.score}
              </text>
            </g>
          ))}
        </svg>
        <p className="text-xs text-muted-foreground mt-1">
          Last {data.length} session{data.length === 1 ? "" : "s"}
        </p>
      </CardContent>
    </Card>
  );
};

const DashboardData = () => {
  return (
    <div className="flex flex-col gap-6">
      <StatCards />
      <QuickActions />
      <div className="grid md:grid-cols-2 gap-4 items-stretch">
        <RecentInterviews />
        <ScoreTrend />
      </div>
      <ActivityCalendar />
    </div>
  );
};

const DashboardBody = () => {
  return (
    <EntityContainer header={<DashboardHeader />}>
      <DashboardData />
    </EntityContainer>
  );
};

export const DashboardContainer = () => {
  return (
    <React.Suspense fallback={<DashboardLoading />}>
      <DashboardBody />
    </React.Suspense>
  );
};

export const DashboardLoading = () => (
  <LoadingView message="Loading your dashboard..." />
);

export const DashboardError = () => (
  <ErrorView message="Failed to load your dashboard. Please try again." />
);
