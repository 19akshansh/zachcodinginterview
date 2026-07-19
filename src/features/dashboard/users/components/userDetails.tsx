"use client";

import Link from "next/link";
import React from "react";
import {
  EntityContainer,
  ErrorView,
  LoadingView,
} from "@/components/layout/shared/entityComponents";
import { RelativeTime } from "@/components/layout/shared/relativeTime";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  APPLICATION_STATUS_LABELS,
  INTERVIEW_TYPE_LABELS,
  ProfileVisibility,
  UserRole,
  VERDICT_LABELS,
  Verdict,
} from "@/config/enums";
import { UserAdminActions } from "@/features/admin/components/usersTable";
import { authClient } from "@/lib/auth/client";
import { useSuspenseUserDetail } from "../hooks/useUsers";

const VERDICT_STYLES: Record<string, string> = {
  [Verdict.STRONG_HIRE]: "bg-primary/10 text-primary border-primary/20",
  [Verdict.HIRE]: "bg-primary/10 text-primary border-primary/20",
  [Verdict.LEAN_HIRE]: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  [Verdict.NO_HIRE]: "bg-red-500/10 text-red-500 border-red-500/20",
  [Verdict.STRONG_NO_HIRE]: "bg-red-500/10 text-red-500 border-red-500/20",
};

const titleCase = (value: string) =>
  value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");

const initialsFor = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

type DetailResult = ReturnType<typeof useSuspenseUserDetail>["data"];

const StatChip = ({ label, value }: { label: string; value: number }) => (
  <div className="flex flex-col items-center rounded-lg border border-border px-4 py-2">
    <span className="text-lg font-semibold">{value}</span>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

const UserDetailHeader = ({ data }: { data: DetailResult }) => {
  const { data: session } = authClient.useSession();
  const { profile, tier } = data;
  const isSelf = session?.user?.id === profile.id;
  const isAdmin = tier === "admin";
  const hasFullDetail = tier === "admin" || tier === "self";

  return (
    <Card className="shadow-none">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar className="size-14">
            <AvatarImage src={profile.image ?? undefined} alt={profile.name} />
            <AvatarFallback>{initialsFor(profile.name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-lg font-semibold">
                {profile.name}
              </span>
              <Badge variant="outline" className="text-[10px] capitalize">
                {profile.role.toLowerCase()}
              </Badge>
              {hasFullDetail && "banned" in profile && profile.banned && (
                <Badge variant="destructive" className="text-[10px]">
                  Banned
                </Badge>
              )}
              {hasFullDetail && "profileVisibility" in profile && (
                <Badge variant="secondary" className="text-[10px]">
                  {profile.profileVisibility === ProfileVisibility.PUBLIC
                    ? "Visible to recruiters & candidates"
                    : "Private"}
                </Badge>
              )}
            </div>
            <p className="truncate text-xs text-muted-foreground">
              Joined <RelativeTime date={profile.createdAt} />
              {hasFullDetail && "email" in profile && ` · ${profile.email}`}
            </p>
            {profile.bio && (
              <p className="max-w-md truncate text-sm text-muted-foreground">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-4">
          <StatChip label="Interviews" value={profile.counts.interviews} />
          <StatChip label="Practice" value={profile.counts.practiceAttempts} />
          {isAdmin && !isSelf && (
            <UserAdminActions
              user={{
                id: profile.id,
                name: profile.name,
                role: profile.role as UserRole,
                banned: "banned" in profile ? Boolean(profile.banned) : false,
              }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const InterviewsSection = ({
  interviews,
}: {
  interviews: Extract<DetailResult, { interviews: unknown }>["interviews"];
}) => {
  if (interviews.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground">
        Interviews
      </h2>
      <div className="flex flex-col gap-y-3">
        {interviews.map((interview) => (
          <Card key={interview.id} className="p-4 shadow-none">
            <CardContent className="flex flex-col gap-2 p-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-sm font-medium">
                  {interview.title || INTERVIEW_TYPE_LABELS[interview.type]}
                </span>
                <p className="text-xs text-muted-foreground">
                  {titleCase(interview.status)} ·{" "}
                  <RelativeTime date={interview.createdAt} />
                </p>
              </div>
              {interview.report ? (
                <Link
                  href={`/reports/${interview.report.id}`}
                  className="flex items-center gap-2"
                >
                  {interview.report.verdict && (
                    <Badge
                      variant="outline"
                      className={VERDICT_STYLES[interview.report.verdict] ?? ""}
                    >
                      {VERDICT_LABELS[interview.report.verdict]}
                    </Badge>
                  )}
                  <Badge variant="secondary">
                    {interview.report.overallScore}/100
                  </Badge>
                </Link>
              ) : (
                <Badge variant="outline" className="text-[10px]">
                  No report yet
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const PracticeHistorySection = ({
  practiceAttempts,
}: {
  practiceAttempts: Extract<
    DetailResult,
    { practiceAttempts: unknown }
  >["practiceAttempts"];
}) => {
  if (practiceAttempts.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground">
        Practice history
      </h2>
      <div className="flex flex-col gap-y-3">
        {practiceAttempts.map((attempt) => (
          <Card key={attempt.id} className="p-4 shadow-none">
            <CardContent className="flex flex-col gap-2 p-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-sm font-medium">
                  {attempt.question.title}
                </span>
                <p className="text-xs text-muted-foreground">
                  {INTERVIEW_TYPE_LABELS[attempt.question.type]} ·{" "}
                  <RelativeTime date={attempt.createdAt} />
                </p>
              </div>
              {attempt.result && (
                <Badge variant="outline" className="text-[10px]">
                  {titleCase(attempt.result)}
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const RecruiterApplicationsSection = ({
  recruiterApplications,
}: {
  recruiterApplications: Extract<
    DetailResult,
    { recruiterApplications: unknown }
  >["recruiterApplications"];
}) => {
  if (recruiterApplications.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground">
        Recruiter application history
      </h2>
      <div className="flex flex-col gap-y-3">
        {recruiterApplications.map((application) => (
          <Card key={application.id} className="p-4 shadow-none">
            <CardContent className="flex flex-col gap-1 p-0">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  {APPLICATION_STATUS_LABELS[application.status]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  <RelativeTime date={application.createdAt} />
                </span>
              </div>
              <p className="truncate text-sm">{application.description}</p>
              {application.reviewNote && (
                <p className="text-xs text-muted-foreground">
                  Reviewer note: {application.reviewNote}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const UserDetailData = ({ userId }: { userId: string }) => {
  const { data } = useSuspenseUserDetail(userId);

  return (
    <EntityContainer>
      <div className="flex flex-col gap-y-6">
        <UserDetailHeader data={data} />

        {data.tier !== "public" && (
          <InterviewsSection interviews={data.interviews} />
        )}
        {(data.tier === "admin" || data.tier === "self") && (
          <>
            <PracticeHistorySection practiceAttempts={data.practiceAttempts} />
            <RecruiterApplicationsSection
              recruiterApplications={data.recruiterApplications}
            />
          </>
        )}
      </div>
    </EntityContainer>
  );
};

export const UserDetail = ({ userId }: { userId: string }) => (
  <React.Suspense fallback={<UserDetailLoading />}>
    <UserDetailData userId={userId} />
  </React.Suspense>
);

export const UserDetailLoading = () => (
  <LoadingView message="Loading profile..." />
);

export const UserDetailError = () => (
  <ErrorView message="Failed to load this profile. Please try again." />
);
