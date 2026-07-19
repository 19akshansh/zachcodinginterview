import { ErrorBoundary } from "react-error-boundary";
import { requireAdmin } from "@/lib/auth/utils";
import { HydrateClient } from "@/trpc/server";
import {
  QuestionsReviewError,
  QuestionsReviewQueue,
} from "@/features/admin/components/questionsReviewQueue";
import { adminQuestionsParamsLoader } from "@/features/admin/server/paramsLoader";
import { prefetchAdminPendingQuestions } from "@/features/admin/server/prefetch";

type QuestionsPageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    status?: string;
  }>;
};

const Page = async (props: QuestionsPageProps) => {
  await requireAdmin();
  const { page, pageSize, status } = await adminQuestionsParamsLoader(
    props.searchParams,
  );

  try {
    await prefetchAdminPendingQuestions({
      page,
      pageSize,
      status: status ?? undefined,
    });
  } catch {
    console.error("Something went wrong. Please try again.");
  }

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<QuestionsReviewError />}>
        <QuestionsReviewQueue />
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
