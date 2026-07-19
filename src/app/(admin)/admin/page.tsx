import { ErrorBoundary } from "react-error-boundary";
import { requireAdmin } from "@/lib/auth/utils";
import { HydrateClient } from "@/trpc/server";
import {
  AdminOverview,
  AdminOverviewError,
} from "@/features/admin/components/admin";
import {
  prefetchAdminOverview,
  prefetchAdminSignupTrend,
} from "@/features/admin/server/prefetch";

const Page = async () => {
  await requireAdmin();

  try {
    await Promise.all([
      prefetchAdminOverview(),
      prefetchAdminSignupTrend({ days: 30 }),
    ]);
  } catch {
    console.error("Something went wrong. Please try again.");
  }

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<AdminOverviewError />}>
        <AdminOverview />
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
