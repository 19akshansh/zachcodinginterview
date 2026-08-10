import { ErrorBoundary } from "react-error-boundary";
import {
  AnalyticsError,
  AnalyticsPage as AnalyticsPageContent,
} from "@/features/recruiters/components/analyticsPage";
import { recruitersParamsLoader } from "@/features/recruiters/server/paramsLoader";
import { prefetchAnalytics } from "@/features/recruiters/server/prefetch";
import { requireRecruiter } from "@/lib/auth/utils";
import { HydrateClient } from "@/trpc/server";

type AnalyticsPageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
  }>;
};

const Page = async (props: AnalyticsPageProps) => {
  await requireRecruiter();
  const { page, pageSize, search } = await recruitersParamsLoader(
    props.searchParams,
  );

  try {
    await prefetchAnalytics({ page, pageSize, search });
  } catch {
    console.error("Something went wrong. Please try again.");
  }

  return (
    <HydrateClient>
      <div className="p-4 md:px-10 md:py-6 h-full max-w-[100vw] overflow-x-hidden">
        <div className="mx-auto max-w-screen-xl w-full flex flex-col gap-y-8">
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-semibold">Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Pass rates and average scores across candidates, per question.
            </p>
          </div>

          <ErrorBoundary fallback={<AnalyticsError />}>
            <AnalyticsPageContent />
          </ErrorBoundary>
        </div>
      </div>
    </HydrateClient>
  );
};

export default Page;
