import { ErrorBoundary } from "react-error-boundary";
import { requireAuth } from "@/lib/authUtils";
import { HydrateClient } from "@/trpc/server";
import {
  ReportsContainer,
  ReportsError,
} from "@/features/dashboard/reports/components/reports";
import { reportsParamsLoader } from "@/features/dashboard/reports/server/paramsLoader";
import { prefetchReports } from "@/features/dashboard/reports/server/prefetch";

type ReportsPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    pageSize?: string;
  }>;
};

const Page = async (props: ReportsPageProps) => {
  await requireAuth();
  const { page, pageSize, search } = await reportsParamsLoader(
    props.searchParams,
  );

  try {
    await prefetchReports({ page, pageSize, search });
  } catch {
    console.error("Something went wrong. Please try again.");
  }

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<ReportsError />}>
        <ReportsContainer />
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
