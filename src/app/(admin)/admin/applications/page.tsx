import { ErrorBoundary } from "react-error-boundary";
import { requireAdmin } from "@/lib/auth/utils";
import { HydrateClient } from "@/trpc/server";
import {
  ApplicationsError,
  ApplicationsQueue,
} from "@/features/admin/components/applicationsQueue";
import { adminApplicationsParamsLoader } from "@/features/admin/server/paramsLoader";
import { prefetchAdminApplications } from "@/features/admin/server/prefetch";

type ApplicationsPageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    status?: string;
    search?: string;
  }>;
};

const Page = async (props: ApplicationsPageProps) => {
  await requireAdmin();
  const { page, pageSize, status, search } =
    await adminApplicationsParamsLoader(props.searchParams);

  try {
    await prefetchAdminApplications({
      page,
      pageSize,
      status: status ?? undefined,
      search,
    });
  } catch {
    console.error("Something went wrong. Please try again.");
  }

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<ApplicationsError />}>
        <ApplicationsQueue />
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
