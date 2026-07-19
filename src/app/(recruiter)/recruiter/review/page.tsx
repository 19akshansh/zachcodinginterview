import { ErrorBoundary } from "react-error-boundary";
import {
  ReviewError,
  ReviewQueue,
} from "@/features/recruiters/components/reviewQueue";
import { recruiterReviewParamsLoader } from "@/features/recruiters/server/paramsLoader";
import { prefetchReviewQueue } from "@/features/recruiters/server/prefetch";
import { requireRecruiter } from "@/lib/auth/utils";
import { HydrateClient } from "@/trpc/server";

type ReviewPageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
  }>;
};

const Page = async (props: ReviewPageProps) => {
  await requireRecruiter();
  const { page, pageSize } = await recruiterReviewParamsLoader(
    props.searchParams,
  );

  try {
    await prefetchReviewQueue({ page, pageSize });
  } catch {
    console.error("Something went wrong. Please try again.");
  }

  return (
    <HydrateClient>
      <div className="p-4 md:px-10 md:py-6 h-full max-w-[100vw] overflow-x-hidden">
        <div className="mx-auto max-w-screen-xl w-full flex flex-col gap-y-8">
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-semibold">Review</h1>
            <p className="text-sm text-muted-foreground">
              Review completed interviews and make a hire call.
            </p>
          </div>

          <ErrorBoundary fallback={<ReviewError />}>
            <ReviewQueue />
          </ErrorBoundary>
        </div>
      </div>
    </HydrateClient>
  );
};

export default Page;
