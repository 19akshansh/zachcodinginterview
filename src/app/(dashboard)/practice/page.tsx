import { requireAuth } from "@/lib/auth/utils";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import {
  PracticeContainer,
  PracticeError,
} from "@/features/dashboard/practice/components/practice";
import { practiceParamsLoader } from "@/features/dashboard/practice/server/paramsLoader";
import { prefetchPracticeQuestions } from "@/features/dashboard/practice/server/prefetch";

type PracticePageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    pageSize?: string;
    type?: string;
    difficulty?: string;
    seniorityLevel?: string;
    companyTier?: string;
  }>;
};

const Page = async (props: PracticePageProps) => {
  await requireAuth();
  const {
    page,
    pageSize,
    search,
    type,
    difficulty,
    seniorityLevel,
    companyTier,
  } = await practiceParamsLoader(props.searchParams);

  try {
    await prefetchPracticeQuestions({
      page,
      pageSize,
      search,
      type: type ?? undefined,
      difficulty: difficulty ?? undefined,
      seniorityLevel: seniorityLevel ?? undefined,
      companyTier: companyTier ?? undefined,
    });
  } catch {
    console.error("Something went wrong. Please try again.");
  }

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<PracticeError />}>
        <PracticeContainer />
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
