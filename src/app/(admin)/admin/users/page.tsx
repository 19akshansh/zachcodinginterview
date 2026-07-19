import { ErrorBoundary } from "react-error-boundary";
import { requireAdmin } from "@/lib/auth/utils";
import { HydrateClient } from "@/trpc/server";
import {
  UsersError,
  UsersTable,
} from "@/features/admin/components/usersTable";
import { adminUsersParamsLoader } from "@/features/admin/server/paramsLoader";
import { prefetchAdminUsers } from "@/features/admin/server/prefetch";

type UsersPageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    role?: string;
  }>;
};

const Page = async (props: UsersPageProps) => {
  await requireAdmin();
  const { page, pageSize, search, role } = await adminUsersParamsLoader(
    props.searchParams,
  );

  try {
    await prefetchAdminUsers({
      page,
      pageSize,
      search,
      role: role ?? undefined,
    });
  } catch {
    console.error("Something went wrong. Please try again.");
  }

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<UsersError />}>
        <UsersTable />
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
