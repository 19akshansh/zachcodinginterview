import { requireAuth } from "@/lib/auth/utils";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import {
  InterviewsContainer,
  InterviewsError,
} from "@/features/dashboard/interviews/components/interviews";
import { interviewsParamsLoader } from "@/features/dashboard/interviews/server/paramsLoader";
import { prefetchInterviews } from "@/features/dashboard/interviews/server/prefetch";

type InterviewsPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    pageSize?: string;
  }>;
};

const Page = async (props: InterviewsPageProps) => {
  await requireAuth();
  const { page, pageSize, search } = await interviewsParamsLoader(
    props.searchParams,
  );

  try {
    await prefetchInterviews({ page, pageSize, search });
  } catch {
    console.error("Something went wrong. Please try again.");
  }

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<InterviewsError />}>
        <InterviewsContainer />
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
