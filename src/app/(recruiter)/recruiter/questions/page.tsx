import { ErrorBoundary } from "react-error-boundary";
import { requireRecruiter } from "@/lib/auth/utils";
import { HydrateClient } from "@/trpc/server";
import {
  RecruiterQuestionsContainer,
  RecruiterQuestionsError,
} from "@/features/dashboard/recruiters/components/recruiterQuestionsForm";
import { recruitersParamsLoader } from "@/features/dashboard/recruiters/server/paramsLoader";
import { prefetchMyQuestions } from "@/features/dashboard/recruiters/server/prefetch";

type QuestionsPageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
  }>;
};

const Page = async (props: QuestionsPageProps) => {
  await requireRecruiter();
  const { page, pageSize, search } = await recruitersParamsLoader(
    props.searchParams,
  );

  try {
    await prefetchMyQuestions({ page, pageSize, search });
  } catch {
    console.error("Something went wrong. Please try again.");
  }

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<RecruiterQuestionsError />}>
        <RecruiterQuestionsContainer />
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
