import { ErrorBoundary } from "react-error-boundary";
import {
  DashboardContainer,
  DashboardError,
} from "@/features/dashboard/home/components/dashboard";
import { homeParamsLoader } from "@/features/dashboard/home/server/paramsLoader";
import {
  prefetchDashboardActivity,
  prefetchDashboardRecentInterviews,
  prefetchDashboardScoreTrend,
  prefetchDashboardSummary,
} from "@/features/dashboard/home/server/prefetch";
import { requireAuth } from "@/lib/auth/utils";
import { HydrateClient } from "@/trpc/server";

type DashboardPageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
  }>;
};

const Page = async (props: DashboardPageProps) => {
  await requireAuth();
  const { page, pageSize } = await homeParamsLoader(props.searchParams);

  try {
    await Promise.all([
      prefetchDashboardSummary(),
      prefetchDashboardScoreTrend(5),
      prefetchDashboardRecentInterviews({ page, pageSize }),
      prefetchDashboardActivity(),
    ]);
  } catch {
    console.error("Something went wrong. Please try again.");
  }

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<DashboardError />}>
        <DashboardContainer />
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
