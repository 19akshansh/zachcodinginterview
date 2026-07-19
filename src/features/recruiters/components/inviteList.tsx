"use client";

import React from "react";
import Link from "next/link";
import { CheckIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";
import {
  EmptyView,
  EntityList,
  EntityPagination,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  INTERVIEW_TYPE_LABELS,
  InviteStatus,
  SENIORITY_LABELS,
} from "@/config/enums";
import { useSuspenseInvites } from "../hooks/useRecruiters";
import { useRecruiterInvitesParams } from "../hooks/useRecruitersParams";

type InvitesQueryResult = ReturnType<typeof useSuspenseInvites>;
type InviteItem = InvitesQueryResult["data"]["items"][number];

const STATUS_BADGE: Record<
  InviteStatus,
  {
    label: string;
    variant: "outline" | "default" | "secondary" | "destructive";
  }
> = {
  [InviteStatus.PENDING]: { label: "Pending", variant: "outline" },
  [InviteStatus.ACCEPTED]: { label: "Redeemed", variant: "default" },
  [InviteStatus.DECLINED]: { label: "Declined", variant: "destructive" },
  [InviteStatus.COMPLETED]: { label: "Completed", variant: "secondary" },
};

const CopyCodeButton = ({ code }: { code: string }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy — copy it manually instead.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 py-1 font-mono text-xs font-semibold tracking-widest hover:bg-muted transition-colors"
      title="Copy invite code"
    >
      {code}
      {copied ? (
        <CheckIcon className="size-3 text-primary" />
      ) : (
        <CopyIcon className="size-3 text-muted-foreground" />
      )}
    </button>
  );
};

const InviteRow = ({ invite }: { invite: InviteItem }) => {
  const status = STATUS_BADGE[invite.status];
  const displayName = invite.candidate?.name || invite.candidateEmail;

  return (
    <Card className="p-4 shadow-none">
      <CardContent className="flex flex-col gap-3 p-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="truncate text-base font-medium">
              {displayName}
            </CardTitle>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <CardDescription className="text-xs">
            {INTERVIEW_TYPE_LABELS[invite.type]} ·{" "}
            {SENIORITY_LABELS[invite.seniorityLevel]} ·{" "}
            {invite.difficulty.charAt(0) +
              invite.difficulty.slice(1).toLowerCase()}
          </CardDescription>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {invite.status === InviteStatus.PENDING && !invite.interviewId && (
            <CopyCodeButton code={invite.code} />
          )}
          {invite.interviewId && (
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href={`/interviews/${invite.interviewId}`} />}
            >
              View interview
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const InvitesList = ({ invites }: { invites: InvitesQueryResult }) => (
  <EntityList
    items={invites.data.items}
    getKey={(item) => item.id}
    renderItem={(item) => <InviteRow invite={item} />}
    emptyView={<InvitesEmpty />}
  />
);

export const InvitesHeader = () => (
  <div className="flex flex-col">
    <h2 className="text-sm font-semibold">Invited candidates</h2>
    <p className="text-xs text-muted-foreground">
      Everyone you&apos;ve invited, with their redemption status.
    </p>
  </div>
);

export const InvitesStatusFilter = () => {
  const [params, setParams] = useRecruiterInvitesParams();

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
      <Tabs
        value={params.status ?? "ALL"}
        onValueChange={(value) =>
          setParams({
            ...params,
            status: value === "ALL" ? null : (value as InviteStatus),
            page: 1,
          })
        }
      >
        <TabsList className="w-max self-start">
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value={InviteStatus.PENDING}>Pending</TabsTrigger>
          <TabsTrigger value={InviteStatus.ACCEPTED}>Redeemed</TabsTrigger>
          <TabsTrigger value={InviteStatus.COMPLETED}>Completed</TabsTrigger>
          <TabsTrigger value={InviteStatus.DECLINED}>Declined</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export const InvitesPagination = ({
  invites,
}: {
  invites: InvitesQueryResult;
}) => {
  const [params, setParams] = useRecruiterInvitesParams();

  return (
    <EntityPagination
      disabled={invites.isFetching}
      totalPages={invites.data.totalPages}
      page={params.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

const InvitesData = () => {
  const invites = useSuspenseInvites();

  return (
    <div className="flex flex-col gap-y-4">
      <InvitesHeader />
      <InvitesStatusFilter />
      <InvitesList invites={invites} />
      <InvitesPagination invites={invites} />
    </div>
  );
};

export const InvitesTable = () => (
  <React.Suspense fallback={<InvitesLoading />}>
    <InvitesData />
  </React.Suspense>
);

export const InvitesLoading = () => (
  <LoadingView message="Loading your invites..." />
);

export const InvitesError = () => (
  <ErrorView message="Failed to load your invites. Please try again." />
);

export const InvitesEmpty = () => (
  <EmptyView
    entity="invite"
    msg="Send your first invite above to get a redeemable code."
  />
);
