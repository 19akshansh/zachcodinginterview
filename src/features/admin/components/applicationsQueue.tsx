"use client";

import React from "react";
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
import { RelativeTime } from "@/components/layout/shared/relativeTime";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApplicationStatus, APPLICATION_STATUS_LABELS } from "@/config/enums";
import { useEntitySearch } from "@/hooks/useEntitySearch";
import { ApplicationReviewDialog } from "./applicationReviewDialog";
import { useSuspenseAdminApplications } from "../hooks/useAdmin";
import { useAdminApplicationsParams } from "../hooks/useAdminParams";

type ApplicationsQueryResult = ReturnType<typeof useSuspenseAdminApplications>;
type ApplicationItem = ApplicationsQueryResult["data"]["items"][number];

const STATUS_TABS: { label: string; value: ApplicationStatus }[] = [
  { label: "Pending", value: ApplicationStatus.PENDING },
  { label: "Approved", value: ApplicationStatus.APPROVED },
  { label: "Rejected", value: ApplicationStatus.REJECTED },
];

const STATUS_BADGE_VARIANT: Record<
  ApplicationStatus,
  "secondary" | "default" | "destructive"
> = {
  [ApplicationStatus.PENDING]: "secondary",
  [ApplicationStatus.APPROVED]: "default",
  [ApplicationStatus.REJECTED]: "destructive",
};

const initialsFor = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const ApplicationRow = ({ application }: { application: ApplicationItem }) => {
  const [open, setOpen] = React.useState(false);
  const isPending = application.status === ApplicationStatus.PENDING;

  return (
    <>
      <Card className="p-4 shadow-none">
        <CardContent className="flex flex-col gap-3 p-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar>
                <AvatarImage
                  src={application.user.image ?? undefined}
                  alt={application.user.name}
                />
                <AvatarFallback>
                  {initialsFor(application.user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-base font-medium">
                    {application.user.name}
                  </span>
                  <Badge
                    variant={STATUS_BADGE_VARIANT[application.status]}
                    className="text-[10px]"
                  >
                    {APPLICATION_STATUS_LABELS[application.status]}
                  </Badge>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {application.user.email} · Submitted{" "}
                  <RelativeTime date={application.createdAt} />
                </p>
              </div>
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

          <p className="line-clamp-2 text-xs text-muted-foreground">
            {application.description}
          </p>

          {!isPending && application.reviewNote && (
            <div className="rounded-lg border bg-muted/20 px-3 py-2 text-xs whitespace-pre-wrap break-words">
              <span className="font-medium text-foreground">Your note: </span>
              <span className="text-muted-foreground">
                {application.reviewNote}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {isPending && (
        <ApplicationReviewDialog
          open={open}
          onOpenChange={setOpen}
          applicationId={application.id}
          applicantName={application.user.name}
          description={application.description}
        />
      )}
    </>
  );
};

export const ApplicationsList = ({
  applications,
}: {
  applications: ApplicationsQueryResult;
}) => (
  <EntityList
    items={applications.data.items}
    getKey={(item) => item.id}
    renderItem={(item) => <ApplicationRow application={item} />}
    emptyView={<ApplicationsEmpty />}
  />
);

export const ApplicationsHeader = () => (
  <EntityHeader
    title="Recruiter applications"
    description="Review who's applying for recruiter access."
  />
);

export const ApplicationsTabs = () => {
  const [params, setParams] = useAdminApplicationsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Tabs
        value={params.status ?? ApplicationStatus.PENDING}
        onValueChange={(value) =>
          setParams({
            ...params,
            status: value as ApplicationStatus,
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
      <EntitySearch
        value={searchValue}
        onChange={onSearchChange}
        placeholder="Search applicants..."
      />
    </div>
  );
};

export const ApplicationsPagination = ({
  applications,
}: {
  applications: ApplicationsQueryResult;
}) => {
  const [params, setParams] = useAdminApplicationsParams();

  return (
    <EntityPagination
      disabled={applications.isFetching}
      totalPages={applications.data.totalPages}
      page={params.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

const ApplicationsData = () => {
  const applications = useSuspenseAdminApplications();

  return (
    <EntityContainer
      header={<ApplicationsHeader />}
      search={<ApplicationsTabs />}
      pagination={<ApplicationsPagination applications={applications} />}
    >
      <ApplicationsList applications={applications} />
    </EntityContainer>
  );
};

export const ApplicationsQueue = () => (
  <React.Suspense fallback={<ApplicationsLoading />}>
    <ApplicationsData />
  </React.Suspense>
);

export const ApplicationsLoading = () => (
  <LoadingView message="Loading applications..." />
);

export const ApplicationsError = () => (
  <ErrorView message="Failed to load applications. Please try again." />
);

export const ApplicationsEmpty = () => (
  <EmptyView
    entity="application"
    msg="No recruiter applications in this status."
  />
);
