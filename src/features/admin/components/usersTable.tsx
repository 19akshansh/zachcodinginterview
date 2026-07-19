"use client";

import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole } from "@/config/enums";
import { useEntitySearch } from "@/hooks/useEntitySearch";
import { authClient } from "@/lib/auth/client";
import { BanDialog } from "./banDialog";
import { useSuspenseAdminUsers, useUpdateUserRole } from "../hooks/useAdmin";
import { useAdminUsersParams } from "../hooks/useAdminParams";

type UsersQueryResult = ReturnType<typeof useSuspenseAdminUsers>;
type UserItem = UsersQueryResult["data"]["items"][number];

const ROLE_FILTERS: { label: string; value: UserRole | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Candidates", value: UserRole.CANDIDATE },
  { label: "Recruiters", value: UserRole.RECRUITER },
  { label: "Admins", value: UserRole.ADMIN },
];

const initialsFor = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export const UserAdminActions = ({
  user,
}: {
  user: { id: string; name: string; role: UserRole; banned: boolean };
}) => {
  const { data: session } = authClient.useSession();
  const [banOpen, setBanOpen] = React.useState(false);
  const updateRole = useUpdateUserRole();

  const isSelf = session?.user?.id === user.id;

  return (
    <>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Select
          value={user.role}
          disabled={isSelf || updateRole.isPending}
          onValueChange={(role) =>
            updateRole.mutate({ userId: user.id, role: role as UserRole })
          }
        >
          <SelectTrigger className="w-[130px]" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UserRole.CANDIDATE}>Candidate</SelectItem>
            <SelectItem value={UserRole.RECRUITER}>Recruiter</SelectItem>
            <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          size="sm"
          variant={user.banned ? "outline" : "destructive"}
          disabled={isSelf}
          title={isSelf ? "You can't ban or unban your own account" : undefined}
          onClick={() => setBanOpen(true)}
        >
          {user.banned ? "Unban" : "Ban"}
        </Button>
      </div>

      <BanDialog
        open={banOpen}
        onOpenChange={setBanOpen}
        userId={user.id}
        userName={user.name}
        isCurrentlyBanned={user.banned}
      />
    </>
  );
};

const UserRow = ({ user }: { user: UserItem }) => {
  const router = useRouter();
  const isBanned = "banned" in user ? Boolean(user.banned) : false;

  return (
    <Card
      className="p-4 shadow-none cursor-pointer hover:shadow"
      onClick={() => router.push(`/users/${user.id}`)}
    >
      <CardContent className="flex flex-col gap-3 p-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar>
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback>{initialsFor(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-base font-medium">
                {user.name}
              </span>
              <Badge variant="outline" className="text-[10px] capitalize">
                {user.role.toLowerCase()}
              </Badge>
              {isBanned && (
                <Badge variant="destructive" className="text-[10px]">
                  Banned
                </Badge>
              )}
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {user.email} · Joined <RelativeTime date={user.createdAt} />
            </p>
          </div>
        </div>

        <div
          className="flex shrink-0 flex-wrap items-center gap-2"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <UserAdminActions
            user={{
              id: user.id,
              name: user.name,
              role: user.role as UserRole,
              banned: isBanned,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export const UsersList = ({ users }: { users: UsersQueryResult }) => (
  <EntityList
    items={users.data.items}
    getKey={(item) => item.id}
    renderItem={(item) => <UserRow user={item} />}
    emptyView={<UsersEmpty />}
  />
);

export const UsersHeader = () => (
  <EntityHeader
    title="Users"
    description="Manage roles and account access across the platform."
  />
);

export const UsersSearch = () => {
  const [params, setParams] = useAdminUsersParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Tabs
        value={params.role ?? "ALL"}
        onValueChange={(value) =>
          setParams({
            ...params,
            role: value === "ALL" ? null : (value as UserRole),
            page: 1,
          })
        }
      >
        <TabsList>
          {ROLE_FILTERS.map((filter) => (
            <TabsTrigger key={filter.value} value={filter.value}>
              {filter.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <EntitySearch
        value={searchValue}
        onChange={onSearchChange}
        placeholder="Search users..."
      />
    </div>
  );
};

export const UsersPagination = ({ users }: { users: UsersQueryResult }) => {
  const [params, setParams] = useAdminUsersParams();

  return (
    <EntityPagination
      disabled={users.isFetching}
      totalPages={users.data.totalPages}
      page={params.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

const UsersData = () => {
  const users = useSuspenseAdminUsers();

  return (
    <EntityContainer
      header={<UsersHeader />}
      search={<UsersSearch />}
      pagination={<UsersPagination users={users} />}
    >
      <UsersList users={users} />
    </EntityContainer>
  );
};

export const UsersTable = () => (
  <React.Suspense fallback={<UsersLoading />}>
    <UsersData />
  </React.Suspense>
);

export const UsersLoading = () => <LoadingView message="Loading users..." />;

export const UsersError = () => (
  <ErrorView message="Failed to load users. Please try again." />
);

export const UsersEmpty = () => (
  <EmptyView entity="user" msg="No users match your current filters." />
);
