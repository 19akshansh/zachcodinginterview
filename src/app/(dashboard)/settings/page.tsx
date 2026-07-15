import { ErrorBoundary } from "react-error-boundary";
import { requireAuth } from "@/lib/auth/utils";
import { HydrateClient } from "@/trpc/server";
import {
  SettingsContainer,
  SettingsError,
} from "@/features/dashboard/settings/components/settings";
import { prefetchMe } from "@/features/dashboard/settings/server/prefetch";

const Page = async () => {
  await requireAuth();

  try {
    await prefetchMe();
  } catch {
    console.error("Something went wrong. Please try again.");
  }

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<SettingsError />}>
        <SettingsContainer />
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
