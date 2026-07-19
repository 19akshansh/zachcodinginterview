"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import Link from "next/link";
import React from "react";
import {
  BriefcaseIcon,
  FileCheckIcon,
  FileTextIcon,
  MessagesSquareIcon,
  ShieldBanIcon,
  SparklesIcon,
  UserCheckIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import { format } from "date-fns";
import {
  EntityHeader,
  ErrorView,
  LoadingView,
} from "@/components/layout/shared/entityComponents";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  useSuspenseAdminOverview,
  useSuspenseAdminSignupTrend,
} from "../hooks/useAdmin";

const StatCard = ({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  accent: string;
}) => (
  <Card className="p-4 shadow-none ring-1 ring-border">
    <CardContent className="p-0 flex flex-col gap-3">
      <div
        className={`size-9 rounded-lg border flex items-center justify-center ${accent}`}
      >
        <Icon className="size-4.5" />
      </div>
      <div>
        <p className="text-2xl font-semibold tabular-nums">
          {value.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </CardContent>
  </Card>
);

const StatGrid = () => {
  const { data } = useSuspenseAdminOverview();

  const stats = [
    {
      icon: UsersIcon,
      label: "Total users",
      value: data.totalUsers,
      accent: "text-primary bg-primary/10 border-primary/20",
    },
    {
      icon: UserPlusIcon,
      label: "New users (7d)",
      value: data.newUsersLast7Days,
      accent: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      icon: UserPlusIcon,
      label: "New users (30d)",
      value: data.newUsersLast30Days,
      accent: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      icon: ShieldBanIcon,
      label: "Banned users",
      value: data.bannedUsers,
      accent: "text-red-500 bg-red-500/10 border-red-500/20",
    },
    {
      icon: BriefcaseIcon,
      label: "Recruiters",
      value: data.totalRecruiters,
      accent: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    },
    {
      icon: UserCheckIcon,
      label: "Candidates",
      value: data.totalCandidates,
      accent: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      icon: SparklesIcon,
      label: "Currently solving",
      value: data.activeSolvingNow,
      accent: "text-primary bg-primary/10 border-primary/20",
    },
    {
      icon: MessagesSquareIcon,
      label: "Total interviews",
      value: data.totalInterviews,
      accent: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      icon: FileCheckIcon,
      label: "Completed interviews",
      value: data.completedInterviews,
      accent: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      icon: BriefcaseIcon,
      label: "Pending applications",
      value: data.pendingApplications,
      accent: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    },
    {
      icon: FileTextIcon,
      label: "Pending questions",
      value: data.pendingQuestions,
      accent: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
};

const SignupTrendChart = () => {
  const { data } = useSuspenseAdminSignupTrend(30);

  const chartData = data.map((d) => ({
    ...d,
    label: format(new Date(d.date), "MMM d"),
  }));

  return (
    <Card className="p-4 shadow-none ring-1 ring-border">
      <CardContent className="p-0">
        <div className="flex flex-col mb-4">
          <h2 className="text-sm font-semibold">Signups, last 30 days</h2>
          <p className="text-xs text-muted-foreground">
            New user accounts created per day.
          </p>
        </div>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="signupFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeOpacity={0.15} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                tick={{ fontSize: 11 }}
                minTickGap={24}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--chart-1)"
                fill="url(#signupFill)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const PendingShortcuts = () => {
  const { data } = useSuspenseAdminOverview();

  return (
    <ItemGroup className="gap-3">
      <Item variant="outline">
        <ItemMedia variant="icon" className="text-primary">
          <BriefcaseIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Recruiter applications</ItemTitle>
          <ItemDescription>
            {data.pendingApplications} pending review.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" render={<Link href="/admin/applications" />}>
            Review
          </Button>
        </ItemActions>
      </Item>

      <Item variant="outline">
        <ItemMedia variant="icon" className="text-primary">
          <FileTextIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Question approvals</ItemTitle>
          <ItemDescription>
            {data.pendingQuestions} pending review.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" render={<Link href="/admin/questions" />}>
            Review
          </Button>
        </ItemActions>
      </Item>

      <Item variant="outline">
        <ItemMedia variant="icon" className="text-primary">
          <UsersIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Recruiter portal</ItemTitle>
          <ItemDescription>
            As an admin, you can also author questions, invite candidates, and
            review interviews yourself.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button
            size="sm"
            variant="outline"
            render={<Link href="/recruiter" />}
          >
            Open
          </Button>
        </ItemActions>
      </Item>
    </ItemGroup>
  );
};

const OverviewData = () => {
  return (
    <div className="flex flex-col gap-6">
      <StatGrid />
      <SignupTrendChart />
      <PendingShortcuts />
    </div>
  );
};

export const AdminOverview = () => {
  return (
    <div className="p-4 md:px-10 md:py-6 h-full max-w-[100vw] overflow-x-hidden">
      <div className="mx-auto max-w-screen-xl w-full flex flex-col gap-y-8">
        <EntityHeader
          title="Admin overview"
          description="Platform health, growth, and what's waiting on you."
        />
        <React.Suspense fallback={<AdminOverviewLoading />}>
          <OverviewData />
        </React.Suspense>
      </div>
    </div>
  );
};

export const AdminOverviewLoading = () => (
  <LoadingView message="Loading admin overview..." />
);

export const AdminOverviewError = () => (
  <ErrorView message="Failed to load the admin overview. Please try again." />
);
