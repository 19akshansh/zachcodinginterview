import { ErrorBoundary } from "react-error-boundary";
import { requireAuth } from "@/lib/auth/utils";
import { HydrateClient } from "@/trpc/server";
import {
  ResumeContainer,
  ResumeError,
} from "@/features/dashboard/resume/components/resume";
import { prefetchResume } from "@/features/dashboard/resume/server/prefetch";

const Page = async () => {
  await requireAuth();

  try {
    await prefetchResume();
  } catch {
    console.error("Something went wrong. Please try again.");
  }

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<ResumeError />}>
        <ResumeContainer />
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
