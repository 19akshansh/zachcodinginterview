import { ErrorBoundary } from "react-error-boundary";
import {
  ProfileContainer,
  ProfileError,
} from "@/features/dashboard/profile/components/profile";
import {
  prefetchActivity,
  prefetchProfile,
} from "@/features/dashboard/profile/server/prefetch";
import { requireAuth } from "@/lib/auth/utils";
import { HydrateClient } from "@/trpc/server";

const Page = async () => {
  await requireAuth();

  try {
    await Promise.all([prefetchProfile(), prefetchActivity()]);
  } catch {
    console.error("Something went wrong. Please try again.");
  }

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<ProfileError />}>
        <ProfileContainer />
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
